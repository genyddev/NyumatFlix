import "server-only";
import type { CatalogueMovie } from "./catalogue-types";
import { themeForSlug } from "./catalogue-types";
import type { MovieRow } from "./database.types";
import type { MovieVideoSource } from "./player-policy";
import { hasSupabaseEnvironment } from "./supabase/config";
import { createPublicSupabaseClient } from "./supabase/public";
import { createServerSupabaseClient } from "./supabase/server";

function sourceFromRow(row: MovieRow): MovieVideoSource | null {
  if (row.source_type === "internet_archive" && row.internet_archive_identifier) {
    return { type: "internet_archive", identifier: row.internet_archive_identifier };
  }
  if (row.source_type === "bunny_stream" && row.bunny_library_id && row.bunny_video_id) {
    return { type: "bunny_stream", libraryId: row.bunny_library_id, videoId: row.bunny_video_id };
  }
  return null;
}

function publicAssetUrl(path: string | null): string | null {
  if (!path || !hasSupabaseEnvironment()) return null;
  const { data } = createPublicSupabaseClient().storage.from("catalogue-media").getPublicUrl(path);
  return data.publicUrl;
}

export function movieFromRow(row: MovieRow): CatalogueMovie {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    synopsis: row.synopsis,
    year: row.year,
    durationMinutes: row.duration_minutes,
    ageRating: row.age_rating,
    genres: row.genres,
    posterPath: row.poster_path,
    backdropPath: row.backdrop_path,
    posterUrl: publicAssetUrl(row.poster_path),
    backdropUrl: publicAssetUrl(row.backdrop_path),
    rightsStatus: row.rights_status,
    rightsBasis: row.rights_basis,
    rightsNotes: row.rights_notes,
    rightsDocumentPath: row.rights_document_path,
    source: sourceFromRow(row),
    publicationStatus: row.publication_status,
    featured: row.featured,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...themeForSlug(row.slug),
  };
}

export async function listPublicMovies(): Promise<readonly CatalogueMovie[]> {
  if (!hasSupabaseEnvironment()) return [];
  try {
    const { data, error } = await createPublicSupabaseClient()
      .from("movies")
      .select("*")
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false });
    if (error || !data) return [];
    return data.map(movieFromRow);
  } catch {
    return [];
  }
}

export async function getPublicMovie(slug: string): Promise<CatalogueMovie | null> {
  if (!hasSupabaseEnvironment()) return null;
  try {
    const { data, error } = await createPublicSupabaseClient()
      .from("movies")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return error || !data ? null : movieFromRow(data);
  } catch {
    return null;
  }
}

export async function listAdminMovies(): Promise<readonly CatalogueMovie[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("movies").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error("Lista e filmave nuk mund të ngarkohej.");
  return (data ?? []).map(movieFromRow);
}

export async function getAdminMovie(id: string): Promise<CatalogueMovie | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("movies").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("Filmi nuk mund të ngarkohej.");
  return data ? movieFromRow(data) : null;
}

export function searchMovies(movies: readonly CatalogueMovie[], query: string): readonly CatalogueMovie[] {
  const needle = query.trim().toLocaleLowerCase("sq");
  if (!needle) return movies;
  return movies.filter((movie) =>
    [movie.title, movie.tagline, movie.synopsis, ...movie.genres].join(" ").toLocaleLowerCase("sq").includes(needle),
  );
}
