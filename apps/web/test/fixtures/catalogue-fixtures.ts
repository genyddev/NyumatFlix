import type { MovieVideoSource, RightsStatus } from "../../lib/player-policy.ts";

type CatalogueFixture = Readonly<{
  slug: string;
  title: string;
  rightsStatus: RightsStatus;
  source: MovieVideoSource | null;
}>;

// Test-only fictional records. Production code and Supabase migrations never import
// or insert these fixtures.
export const fictionalCatalogueFixtures = [
  {
    slug: "kryqezimi-i-henes",
    title: "Kryqëzimi i Hënës",
    rightsStatus: "unverified",
    source: null,
  },
  {
    slug: "harta-e-heshtur",
    title: "Harta e Heshtur",
    rightsStatus: "unverified",
    source: null,
  },
] as const satisfies readonly CatalogueFixture[];

// This technical Bunny record exists only in tests. It is never seeded into or
// exposed by the production catalogue.
export const privateBunnyMovieFixture = {
  slug: "bunny-stream-test",
  title: "Bunny Stream — Test teknik",
  rightsStatus: "approved",
  source: {
    type: "bunny_stream",
    libraryId: "776547",
    videoId: "05458d36-de04-4453-8536-75f063f37ab1",
  },
} as const satisfies CatalogueFixture;
