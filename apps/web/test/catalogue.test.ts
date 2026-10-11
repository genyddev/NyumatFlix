import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { demoMovies, getDemoMovie, searchDemoMovies } from "../lib/demo-catalogue.ts";

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

  test("contains presentation data but no remote or playback fields", () => {
    const serialized = JSON.stringify(demoMovies);
    assert.doesNotMatch(serialized, /https?:\/\//i);
    assert.doesNotMatch(serialized, /(iframe|videoUrl|streamUrl|embedUrl)/i);
  });

  test("resolves details and searches locally", () => {
    assert.equal(getDemoMovie("harta-e-heshtur")?.title, "Harta e Heshtur");
    assert.deepEqual(searchDemoMovies("fantashkencë").map((movie) => movie.slug), ["sinjali-i-mengjesit"]);
  });

  test("runtime source contains no remote request or arbitrary media renderer", async () => {
    const files = (await Promise.all(["app", "components", "lib"].map((folder) => sourceFiles(`${webRoot}${folder}`)))).flat();
    const runtimeSource = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
    assert.doesNotMatch(runtimeSource, /https?:\/\//i);
    assert.doesNotMatch(runtimeSource, /\bfetch\s*\(/i);
    assert.doesNotMatch(runtimeSource, /<\s*(?:iframe|video|audio|source|embed|object)\b/i);
    assert.doesNotMatch(runtimeSource, /dangerouslySetInnerHTML/i);
  });
});
