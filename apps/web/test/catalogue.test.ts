import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
import {
  isValidInternetArchiveIdentifier,
  isValidBunnyLibraryId,
  isValidBunnyVideoId,
  resolveApprovedPlayback,
} from "../lib/player-policy.ts";
import {
  fictionalCatalogueFixtures,
  privateBunnyMovieFixture,
} from "./fixtures/catalogue-fixtures.ts";
import {
  approvedInternetArchiveFixture,
  approvedBunnyStreamFixture,
} from "./fixtures/private-player-fixtures.ts";
import {
  BACKDROP_MAX_BYTES,
  POSTER_MAX_BYTES,
  RIGHTS_DOCUMENT_MAX_BYTES,
  SERVER_ACTION_BODY_SIZE_LIMIT,
  validateMovieUploads,
} from "../lib/upload-policy.ts";

const webRoot = fileURLToPath(new URL("../", import.meta.url));

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(?:ts|tsx|js|mjs|css)$/.test(entry.name) ? [path] : [];
  }));
  return nested.flat();
}

describe("test-only catalogue fixtures", () => {
  test("uses unique test fixture slugs", () => {
    const fixtures = [...fictionalCatalogueFixtures, privateBunnyMovieFixture];
    assert.equal(new Set(fixtures.map((movie) => movie.slug)).size, fixtures.length);
  });

  test("keeps every fictional fixture unplayable", () => {
    const serialized = JSON.stringify(fictionalCatalogueFixtures);
    assert.doesNotMatch(serialized, /https?:\/\//i);
    assert.ok(fictionalCatalogueFixtures.every((movie) => movie.rightsStatus === "unverified" && movie.source === null));
  });

  test("keeps the approved Bunny technical movie separate from fictional fixtures", () => {
    assert.deepEqual(privateBunnyMovieFixture.source, approvedBunnyStreamFixture.source);
    assert.equal(privateBunnyMovieFixture.rightsStatus, "approved");
    const fictionalSlugs = new Set<string>(fictionalCatalogueFixtures.map((movie) => movie.slug));
    assert.equal(fictionalSlugs.has(privateBunnyMovieFixture.slug), false);
  });

  test("accepts only strict provider identifiers", () => {
    assert.equal(isValidInternetArchiveIdentifier("test_public_domain_film_001"), true);
    assert.equal(isValidInternetArchiveIdentifier("https://archive.org/details/example"), false);
    assert.equal(isValidInternetArchiveIdentifier("../example?file=movie.mp4"), false);
    assert.equal(isValidBunnyLibraryId("776547"), true);
    assert.equal(isValidBunnyLibraryId("https://player.mediadelivery.net"), false);
    assert.equal(isValidBunnyVideoId("05458d36-de04-4453-8536-75f063f37ab1"), true);
    assert.equal(isValidBunnyVideoId("05458d36-de04-4453-8536-75f063f37ab1?autoplay=true"), false);
  });

  test("routes all approved private fixtures and blocks every other rights state", () => {
    assert.deepEqual(resolveApprovedPlayback(approvedInternetArchiveFixture), approvedInternetArchiveFixture.source);
    assert.deepEqual(resolveApprovedPlayback(approvedBunnyStreamFixture), approvedBunnyStreamFixture.source);
    assert.equal(resolveApprovedPlayback({ ...approvedBunnyStreamFixture, rightsStatus: "unverified" }), null);
    assert.equal(resolveApprovedPlayback({ ...approvedInternetArchiveFixture, rightsStatus: "rejected" }), null);
    assert.equal(resolveApprovedPlayback({ rightsStatus: "approved", source: null }), null);
  });

  test("runtime contains only controlled provider frames and no arbitrary media URL path", async () => {
    const files = (await Promise.all(["app", "components", "lib"].map((folder) => sourceFiles(`${webRoot}${folder}`)))).flat();
    const runtimeSource = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
    const remoteUrls = runtimeSource.match(/https?:\/\/[^\s`"']+/gi) ?? [];
    assert.deepEqual(remoteUrls.sort(), [
      "https://archive.org/embed/${identifier}",
      "https://kokomax.al",
      "https://player.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&muted=false",
    ].sort());
    assert.doesNotMatch(runtimeSource, /\bfetch\s*\(/i);
    assert.equal(runtimeSource.match(/<\s*iframe\b/gi)?.length, 2);
    assert.doesNotMatch(runtimeSource, /autoplay=true|muted=true/i);
    assert.doesNotMatch(runtimeSource, /api\.bunny\.net|video\.bunnycdn\.com|BUNNY_?(?:API|ACCESS|SECRET|TOKEN)/i);
    assert.doesNotMatch(runtimeSource, /<\s*(?:video|audio|source|embed|object)\b/i);
    assert.doesNotMatch(runtimeSource, /dangerouslySetInnerHTML/i);
  });

  test("CSP enables React debugging only in development and preserves production restrictions", async () => {
    const previousNodeEnvironment = process.env.NODE_ENV;
    async function cspFor(mode: "development" | "production") {
      Reflect.set(process.env, "NODE_ENV", mode);
      const configUrl = pathToFileURL(`${webRoot}next.config.mjs`);
      configUrl.searchParams.set("test-mode", mode);
      const config = (await import(configUrl.href)).default;
      const headers = await config.headers();
      return headers[0].headers.find((header: { key: string; value: string }) => header.key === "Content-Security-Policy").value as string;
    }
    try {
      const developmentCsp = await cspFor("development");
      const productionCsp = await cspFor("production");
      assert.match(developmentCsp, /script-src[^;]*'unsafe-eval'/);
      assert.doesNotMatch(productionCsp, /unsafe-eval/);
      assert.match(productionCsp, /frame-src https:\/\/archive\.org https:\/\/player\.mediadelivery\.net;/);
      assert.match(productionCsp, /connect-src 'self'; media-src 'none'; worker-src 'none';/);
      assert.doesNotMatch(productionCsp, /storage\.googleapis\.com|youtube|youtu\.be|r2\.cloudflarestorage\.com|media-src\s+\*/i);
    } finally {
      if (previousNodeEnvironment === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
      else Reflect.set(process.env, "NODE_ENV", previousNodeEnvironment);
    }
  });

  test("accepts bounded upload combinations and rejects every individual overage", () => {
    const image = (size: number) => ({ size, type: "image/jpeg" }) as File;
    const document = (size: number) => ({ size, type: "application/pdf" }) as File;

    assert.equal(validateMovieUploads({ poster: image(2 * 1024 * 1024), backdrop: null, rightsDocument: null }), null);
    assert.equal(validateMovieUploads({
      poster: image(POSTER_MAX_BYTES),
      backdrop: image(BACKDROP_MAX_BYTES),
      rightsDocument: document(RIGHTS_DOCUMENT_MAX_BYTES),
    }), null);
    assert.match(validateMovieUploads({ poster: image(POSTER_MAX_BYTES + 1), backdrop: null, rightsDocument: null }) ?? "", /Posteri.*5 MB/);
    assert.match(validateMovieUploads({ poster: null, backdrop: image(BACKDROP_MAX_BYTES + 1), rightsDocument: null }) ?? "", /Sfondi.*5 MB/);
    assert.match(validateMovieUploads({ poster: null, backdrop: null, rightsDocument: document(RIGHTS_DOCUMENT_MAX_BYTES + 1) }) ?? "", /Dokumenti.*10 MB/);
    assert.equal(validateMovieUploads({ poster: null, backdrop: null, rightsDocument: null }), null);
  });

  test("accepts a draft submission with a poster larger than the former 1 MB limit", () => {
    const formData = new FormData();
    for (const [name, value] of Object.entries({
      title: "Provë lokale",
      slug: "prove-lokale",
      tagline: "Test i kufirit të ngarkimit",
      synopsis: "Ky regjistrim ekziston vetëm brenda testit të automatizuar.",
      year: "2026",
      duration_minutes: "90",
      age_rating: "Të gjithë",
      genres: "Test",
      rights_status: "unverified",
      source_type: "",
      publication_status: "draft",
    })) formData.set(name, value);
    formData.set("poster_file", new Blob([new Uint8Array(2 * 1024 * 1024)], { type: "image/png" }), "poster-test.png");

    const poster = formData.get("poster_file") as File;
    assert.equal(formData.get("publication_status"), "draft");
    assert.equal(validateMovieUploads({ poster, backdrop: null, rightsDocument: null }), null);
  });

  test("uses a bounded 22 MB Server Action limit and keeps publication upload-free", async () => {
    const configUrl = pathToFileURL(`${webRoot}next.config.mjs`);
    configUrl.searchParams.set("upload-limit-test", String(Date.now()));
    const config = (await import(configUrl.href)).default;
    assert.equal(SERVER_ACTION_BODY_SIZE_LIMIT, "22mb");
    assert.equal(config.experimental.serverActions.bodySizeLimit, SERVER_ACTION_BODY_SIZE_LIMIT);

    const actions = await readFile(`${webRoot}app/admin/actions.ts`, "utf8");
    const form = await readFile(`${webRoot}components/admin/movie-form.tsx`, "utf8");
    const adminError = await readFile(`${webRoot}app/admin/error.tsx`, "utf8");
    const publicationAction = actions.split("export async function setPublicationAction")[1]?.split("export async function deleteMovieAction")[0] ?? "";
    assert.doesNotMatch(publicationAction, /uploadFiles|poster_file|backdrop_file|rights_document_file/);
    assert.match(actions, /uploads\.updates\.poster_path \?\? current\.data\.poster_path/);
    assert.match(actions, /removeUploadedObjects\(supabase, uploads\.uploaded\)/);
    assert.match(form, /onSubmit=\{validateBeforeSubmit\}/);
    assert.match(form, /role="alert"/);
    assert.match(adminError, /Veprimi nuk mund të përfundohej/);
  });

  test("runtime and package manifest contain exactly two provider implementations", async () => {
    const playerPolicy = await readFile(`${webRoot}lib/player-policy.ts`, "utf8");
    const playerRouter = await readFile(`${webRoot}components/player/safe-movie-player.tsx`, "utf8");
    const packageManifest = await readFile(`${webRoot}package.json`, "utf8");
    assert.deepEqual([...playerPolicy.matchAll(/type: "([a-z_]+)"/g)].map((match) => match[1]), [
      "internet_archive",
      "bunny_stream",
    ]);
    assert.deepEqual(Object.keys(JSON.parse(packageManifest).dependencies).sort(), [
      "@supabase/ssr",
      "@supabase/supabase-js",
      "next",
      "react",
      "react-dom",
    ]);
  });

  test("documents the future domain and Bunny allowlist without changing the test video", async () => {
    const deployment = await readFile(new URL("../../../DEPLOYMENT.md", import.meta.url), "utf8");
    assert.match(deployment, /^kokomax\.al$/m);
    assert.match(deployment, /^www\.kokomax\.al$/m);
    assert.match(deployment, /^localhost$/m);
    assert.match(deployment, /No deployment, DNS change/);

    const testMovie = privateBunnyMovieFixture;
    assert.equal(testMovie.source.type, "bunny_stream");
    if (testMovie.source.type !== "bunny_stream") assert.fail("Expected the Bunny Stream test fixture");
    assert.equal(testMovie.source.libraryId, "776547");
    assert.equal(testMovie.source.videoId, "05458d36-de04-4453-8536-75f063f37ab1");
  });

  test("uses the supplied KokoMax logo and metadata without old user-facing branding", async () => {
    const logo = await readFile(`${webRoot}public/koko-logo.png`);
    assert.equal(createHash("sha256").update(logo).digest("hex"), "597392ac3563f7588aa5aa239f81bc04a17e33e1e8764d89de6493b7824dc9c5");

    const runtimeFiles = (await Promise.all(["app", "components", "lib"].map((folder) => sourceFiles(`${webRoot}${folder}`)))).flat();
    const runtimeSource = (await Promise.all(runtimeFiles.map((file) => readFile(file, "utf8")))).join("\n");
    assert.doesNotMatch(runtimeSource, /Udhekryqi Filma/);
    assert.match(runtimeSource, /KokoMax — Nga Udhekryqi Media/);
    assert.match(runtimeSource, /metadataBase: new URL\(SITE_URL\)/);
    assert.match(runtimeSource, /aria-label="KokoMax — Ballina"/);
    assert.match(runtimeSource, /alt="KokoMax"/);
  });

  test("moves every public catalogue route to the anonymous database repository", async () => {
    const publicPages = [
      `${webRoot}app/page.tsx`,
      `${webRoot}app/movies/page.tsx`,
      `${webRoot}app/movies/[slug]/page.tsx`,
      `${webRoot}app/search/page.tsx`,
    ];
    const source = (await Promise.all(publicPages.map((file) => readFile(file, "utf8")))).join("\n");
    assert.doesNotMatch(source, /demo-catalogue/);
    assert.doesNotMatch(source, /private-test-catalogue/);
    assert.match(source, /catalogue-repository/);

    const repository = await readFile(`${webRoot}lib/catalogue-repository.ts`, "utf8");
    assert.match(repository, /createPublicSupabaseClient/);
    assert.match(repository, /if \(!hasSupabaseEnvironment\(\)\) return \[\]/);
    assert.doesNotMatch(repository, /service.role|service_role/i);
  });

  test("protects admin routes and write actions with verified SSR authentication", async () => {
    const adminAuth = await readFile(`${webRoot}lib/admin-auth.ts`, "utf8");
    const serverClient = await readFile(`${webRoot}lib/supabase/server.ts`, "utf8");
    const proxy = await readFile(`${webRoot}lib/supabase/proxy.ts`, "utf8");
    const actions = await readFile(`${webRoot}app/admin/actions.ts`, "utf8");
    assert.match(adminAuth, /getClaims\(\)/);
    assert.match(adminAuth, /from\("admin_users"\)/);
    assert.match(serverClient, /httpOnly: true|AUTH_COOKIE_OPTIONS/);
    assert.match(proxy, /getClaims\(\)/);
    assert.equal(actions.match(/await requireAdmin\(\)/g)?.length, 4);
    assert.doesNotMatch(actions, /signUp|hardcoded|service_role|BUNNY_?(?:API|SECRET|TOKEN)/i);
  });

  test("keeps production migrations structural and free of catalogue fixtures", async () => {
    const migrationsDirectory = fileURLToPath(new URL("../../../supabase/migrations/", import.meta.url));
    const migrationNames = (await readdir(migrationsDirectory)).filter((name) => name.endsWith(".sql"));
    assert.deepEqual(migrationNames, ["202610130001_phase1_admin_schema.sql"]);
    const schema = await readFile(`${migrationsDirectory}/202610130001_phase1_admin_schema.sql`, "utf8");
    for (const table of ["admin_users", "movies", "admin_audit_log"]) {
      assert.match(schema, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    }
    assert.match(schema, /movies_source_combination/);
    assert.match(schema, /movies_publication_rights/);
    assert.match(schema, /rights_status = 'approved' and publication_status = 'published'/);
    assert.match(schema, /create trigger movies_audit/);
    assert.match(schema, /'catalogue-media'.*true/s);
    assert.match(schema, /'rights-documents'.*false/s);
    assert.doesNotMatch(schema, /insert\s+into\s+public\.movies/i);
    assert.doesNotMatch(schema, /bunny-stream-test|05458d36-de04-4453-8536-75f063f37ab1|Kryqëzimi i Hënës/i);
  });

  test("provides only public Supabase environment names and no secret-key slot", async () => {
    const environment = await readFile(new URL("../../../.env.example", import.meta.url), "utf8");
    assert.match(environment, /^NEXT_PUBLIC_SUPABASE_URL=$/m);
    assert.match(environment, /^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$/m);
    assert.doesNotMatch(environment, /^(?!#).*(?:SERVICE|SECRET|BUNNY|PASSWORD).*=/im);
  });
});
