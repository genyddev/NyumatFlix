import type { MovieVideoSource, RightsStatus } from "./player-policy";

export type PublicationStatus = "draft" | "published";
export type PosterMotif = "orbit" | "ridge" | "signal" | "archive" | "city" | "line";

export type MoviePresentation = Readonly<{
  slug: string;
  title: string;
  tagline: string;
  year: number;
  durationMinutes: number;
  ageRating: string;
  genres: readonly string[];
  synopsis: string;
  posterPath: string | null;
  backdropPath: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  rightsStatus: RightsStatus;
  source: MovieVideoSource | null;
  accent: string;
  shadow: string;
  motif: PosterMotif;
}>;

export type CatalogueMovie = MoviePresentation & Readonly<{
  id: string;
  rightsBasis: string;
  rightsNotes: string;
  rightsDocumentPath: string | null;
  publicationStatus: PublicationStatus;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

const visualThemes: readonly Readonly<{ accent: string; shadow: string; motif: PosterMotif }>[] = [
  { accent: "#f4b45f", shadow: "#6f2f40", motif: "orbit" },
  { accent: "#83c7b8", shadow: "#173b45", motif: "ridge" },
  { accent: "#f26d78", shadow: "#381c45", motif: "signal" },
  { accent: "#d9c28b", shadow: "#3c4a49", motif: "archive" },
  { accent: "#f0ca55", shadow: "#18224a", motif: "city" },
  { accent: "#61bce8", shadow: "#18345a", motif: "line" },
];

export function themeForSlug(slug: string) {
  const score = [...slug].reduce((sum, character) => sum + character.codePointAt(0)!, 0);
  return visualThemes[score % visualThemes.length]!;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}o ${remainder}m`;
}
