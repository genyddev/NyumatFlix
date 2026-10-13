import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { demoMovies, getDemoMovie, searchDemoMovies } from "../lib/demo-catalogue.ts";
import { privateTestMovies } from "../lib/private-test-catalogue.ts";
import {
  isValidInternetArchiveIdentifier,
  isValidBunnyLibraryId,
  isValidBunnyVideoId,
  resolveApprovedPlayback,
} from "../lib/player-policy.ts";
import {
  approvedInternetArchiveFixture,
  approvedBunnyStreamFixture,
} from "./fixtures/private-player-fixtures.ts";

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

describe("local demonstration catalogue", () => {
  test("uses unique local slugs", () => {
    assert.equal(new Set(demoMovies.map((movie) => movie.slug)).size, demoMovies.length);
  });

  test("keeps every fictional public catalogue record unplayable", () => {
    const serialized = JSON.stringify(demoMovies);
    assert.doesNotMatch(serialized, /https?:\/\//i);
    assert.ok(demoMovies.every((movie) => movie.rightsStatus === "unverified" && movie.source === null));
  });

  test("resolves details and searches locally", () => {
    assert.equal(getDemoMovie("harta-e-heshtur")?.title, "Harta e Heshtur");
    assert.deepEqual(searchDemoMovies("fantashkencë").map((movie) => movie.slug), ["sinjali-i-mengjesit"]);
  });

  test("keeps the approved Bunny technical movie out of every public collection", () => {
    assert.equal(privateTestMovies.length, 1);
    assert.deepEqual(privateTestMovies[0]?.source, approvedBunnyStreamFixture.source);
    assert.equal(privateTestMovies[0]?.rightsStatus, "approved");
    const publicSlugs = new Set<string>(demoMovies.map((movie) => movie.slug));
    assert.equal(publicSlugs.has(privateTestMovies[0]?.slug ?? ""), false);
    assert.equal(searchDemoMovies("Bunny Stream").length, 0);
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

  test("CSP permits exactly the Archive and Bunny frame origins", async () => {
    const config = await readFile(`${webRoot}next.config.mjs`, "utf8");
    assert.match(config, /frame-src https:\/\/archive\.org https:\/\/player\.mediadelivery\.net;/);
    assert.match(config, /connect-src 'self'; media-src 'none'; worker-src 'none';/);
    assert.doesNotMatch(config, /storage\.googleapis\.com|youtube|youtu\.be|r2\.cloudflarestorage\.com/i);
    assert.doesNotMatch(config, /media-src\s+\*/i);
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

    const testMovie = privateTestMovies[0];
    assert.equal(testMovie?.source.type, "bunny_stream");
    if (testMovie?.source.type !== "bunny_stream") assert.fail("Expected the Bunny Stream test fixture");
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

  test("defines database constraints, RLS, storage policies, audit logging, and safe seeds", async () => {
    const schema = await readFile(new URL("../../../supabase/migrations/202610130001_phase1_admin_schema.sql", import.meta.url), "utf8");
    const seed = await readFile(new URL("../../../supabase/migrations/202610130002_seed_demo_catalogue.sql", import.meta.url), "utf8");
    for (const table of ["admin_users", "movies", "admin_audit_log"]) {
      assert.match(schema, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    }
    assert.match(schema, /movies_source_combination/);
    assert.match(schema, /movies_publication_rights/);
    assert.match(schema, /rights_status = 'approved' and publication_status = 'published'/);
    assert.match(schema, /create trigger movies_audit/);
    assert.match(schema, /'catalogue-media'.*true/s);
    assert.match(schema, /'rights-documents'.*false/s);
    assert.match(seed, /'bunny-stream-test'.*'approved'.*'bunny_stream'.*'776547'.*'05458d36-de04-4453-8536-75f063f37ab1'.*'draft'/s);
    assert.equal((seed.match(/'unverified'/g) ?? []).length, 6);
    assert.doesNotMatch(seed, /'unverified'[^;]*'published'/s);
  });

  test("provides only public Supabase environment names and no secret-key slot", async () => {
    const environment = await readFile(new URL("../../../.env.example", import.meta.url), "utf8");
    assert.match(environment, /^NEXT_PUBLIC_SUPABASE_URL=$/m);
    assert.match(environment, /^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$/m);
    assert.doesNotMatch(environment, /^(?!#).*(?:SERVICE|SECRET|BUNNY|PASSWORD).*=/im);
  });
});
