import type { DemoMovie } from "./demo-catalogue";

// Unlisted technical fixtures are available only by their direct route. Public
// catalogue, homepage, rows, and search functions never import this collection.
export const privateTestMovies = [
  {
    slug: "bunny-stream-test",
    title: "Bunny Stream — Test teknik",
    tagline: "Provë private e riprodhuesit të sigurt.",
    year: 2026,
    durationMinutes: 1,
    ageRating: "Test",
    genres: ["Test teknik"],
    synopsis: "Regjistrim i palistuar që përdoret vetëm për të verifikuar integrimin teknik me Bunny Stream.",
    accent: "#f2a65a",
    shadow: "#213c50",
    motif: "signal",
    posterUrl: null,
    backdropUrl: null,
    posterPath: null,
    backdropPath: null,
    rightsStatus: "approved",
    source: {
      type: "bunny_stream",
      libraryId: "776547",
      videoId: "05458d36-de04-4453-8536-75f063f37ab1",
    },
  },
] as const satisfies readonly DemoMovie[];

export function getPrivateTestMovie(slug: string): DemoMovie | undefined {
  return privateTestMovies.find((movie) => movie.slug === slug);
}
