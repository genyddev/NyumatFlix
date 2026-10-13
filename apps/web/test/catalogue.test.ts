import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { demoMovies, getDemoMovie, searchDemoMovies } from "../lib/demo-catalogue.ts";
import { privateTestMovies } from "../lib/private-test-catalogue.ts";
import {
  isValidInternetArchiveIdentifier,
  isValidBunnyLibraryId,
  isValidBunnyVideoId,
  isValidMuxPlaybackId,
  resolveApprovedPlayback,
} from "../lib/player-policy.ts";
import {
  approvedInternetArchiveFixture,
  approvedBunnyStreamFixture,
  approvedMuxFixture,
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
    assert.equal(isValidMuxPlaybackId("TestMuxPlaybackId_0123456789"), true);
    assert.equal(isValidMuxPlaybackId("https://stream.mux.com/example.m3u8"), false);
    assert.equal(isValidMuxPlaybackId("short-id"), false);
    assert.equal(isValidBunnyLibraryId("776547"), true);
    assert.equal(isValidBunnyLibraryId("https://player.mediadelivery.net"), false);
    assert.equal(isValidBunnyVideoId("05458d36-de04-4453-8536-75f063f37ab1"), true);
    assert.equal(isValidBunnyVideoId("05458d36-de04-4453-8536-75f063f37ab1?autoplay=true"), false);
  });

  test("routes all approved private fixtures and blocks every other rights state", () => {
    assert.deepEqual(resolveApprovedPlayback(approvedInternetArchiveFixture), approvedInternetArchiveFixture.source);
    assert.deepEqual(resolveApprovedPlayback(approvedMuxFixture), approvedMuxFixture.source);
    assert.deepEqual(resolveApprovedPlayback(approvedBunnyStreamFixture), approvedBunnyStreamFixture.source);
    assert.equal(resolveApprovedPlayback({ ...approvedMuxFixture, rightsStatus: "unverified" }), null);
    assert.equal(resolveApprovedPlayback({ ...approvedInternetArchiveFixture, rightsStatus: "rejected" }), null);
    assert.equal(resolveApprovedPlayback({ rightsStatus: "approved", source: null }), null);
  });

  test("runtime contains only controlled provider frames and no arbitrary media URL path", async () => {
    const files = (await Promise.all(["app", "components", "lib"].map((folder) => sourceFiles(`${webRoot}${folder}`)))).flat();
    const runtimeSource = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
    const remoteUrls = runtimeSource.match(/https?:\/\/[^\s`"']+/gi) ?? [];
    assert.deepEqual(remoteUrls.sort(), [
      "https://archive.org/embed/${identifier}",
      "https://player.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&muted=false",
    ].sort());
    assert.doesNotMatch(runtimeSource, /\bfetch\s*\(/i);
    assert.equal(runtimeSource.match(/<\s*iframe\b/gi)?.length, 2);
    assert.doesNotMatch(runtimeSource, /autoplay=true|muted=true/i);
    assert.doesNotMatch(runtimeSource, /api\.bunny\.net|video\.bunnycdn\.com|BUNNY_?(?:API|ACCESS|SECRET|TOKEN)/i);
    assert.doesNotMatch(runtimeSource, /<\s*(?:video|audio|source|embed|object)\b/i);
    assert.doesNotMatch(runtimeSource, /dangerouslySetInnerHTML/i);
  });

  test("CSP permits playback origins but no upload, R2, or YouTube origin", async () => {
    const config = await readFile(`${webRoot}next.config.mjs`, "utf8");
    assert.match(config, /frame-src https:\/\/archive\.org/);
    assert.match(config, /frame-src [^;]*https:\/\/player\.mediadelivery\.net/);
    assert.match(config, /media-src blob: https:\/\/\*\.mux\.com/);
    assert.match(config, /connect-src 'self' https:\/\/\*\.mux\.com https:\/\/\*\.litix\.io/);
    assert.doesNotMatch(config, /storage\.googleapis\.com|youtube|youtu\.be|r2\.cloudflarestorage\.com/i);
    assert.doesNotMatch(config, /media-src\s+\*/i);
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
});
