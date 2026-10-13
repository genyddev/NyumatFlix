import type { MovieInsert, PublicationStatus, RightsStatus, SourceType } from "./database.types";
import { isValidBunnyLibraryId, isValidBunnyVideoId, isValidInternetArchiveIdentifier } from "./player-policy";

export class MovieValidationError extends Error {}

function requiredText(formData: FormData, name: string, label: string, maxLength: number): string {
  const value = String(formData.get(name) ?? "").trim();
  if (!value) throw new MovieValidationError(`${label} është i detyrueshëm.`);
  if (value.length > maxLength) throw new MovieValidationError(`${label} është shumë i gjatë.`);
  return value;
}

function optionalText(formData: FormData, name: string, maxLength: number): string {
  const value = String(formData.get(name) ?? "").trim();
  if (value.length > maxLength) throw new MovieValidationError(`${name} është shumë i gjatë.`);
  return value;
}

function integerField(formData: FormData, name: string, label: string, minimum: number, maximum: number): number {
  const value = Number(formData.get(name));
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new MovieValidationError(`${label} duhet të jetë ndërmjet ${minimum} dhe ${maximum}.`);
  }
  return value;
}

export function parseMovieForm(formData: FormData): MovieInsert {
  const slug = requiredText(formData, "slug", "Slug-u", 120).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new MovieValidationError("Slug-u lejon vetëm shkronja të vogla pa theks, numra dhe viza.");
  }

  const rightsStatus = String(formData.get("rights_status")) as RightsStatus;
  if (!["unverified", "approved", "rejected"].includes(rightsStatus)) throw new MovieValidationError("Statusi i të drejtave nuk është i vlefshëm.");
  const publicationStatus = String(formData.get("publication_status")) as PublicationStatus;
  if (!["draft", "published"].includes(publicationStatus)) throw new MovieValidationError("Statusi i publikimit nuk është i vlefshëm.");
  if (publicationStatus === "published" && rightsStatus !== "approved") {
    throw new MovieValidationError("Vetëm një film me të drejta të miratuara mund të publikohet.");
  }

  const sourceValue = String(formData.get("source_type") ?? "");
  const sourceType = sourceValue ? sourceValue as SourceType : null;
  if (sourceType !== null && !["internet_archive", "bunny_stream"].includes(sourceType)) {
    throw new MovieValidationError("Burimi i videos nuk është i vlefshëm.");
  }

  const archiveIdentifier = optionalText(formData, "internet_archive_identifier", 100) || null;
  const bunnyLibraryId = optionalText(formData, "bunny_library_id", 18) || null;
  const bunnyVideoId = optionalText(formData, "bunny_video_id", 36) || null;
  if (sourceType === "internet_archive" && (!archiveIdentifier || !isValidInternetArchiveIdentifier(archiveIdentifier) || bunnyLibraryId || bunnyVideoId)) {
    throw new MovieValidationError("Internet Archive kërkon vetëm një identifikues të vlefshëm.");
  }
  if (sourceType === "bunny_stream" && (!bunnyLibraryId || !bunnyVideoId || !isValidBunnyLibraryId(bunnyLibraryId) || !isValidBunnyVideoId(bunnyVideoId) || archiveIdentifier)) {
    throw new MovieValidationError("Bunny Stream kërkon Library ID dhe Video ID të vlefshme, pa URL ose iframe.");
  }
  if (sourceType === null && (archiveIdentifier || bunnyLibraryId || bunnyVideoId)) {
    throw new MovieValidationError("Zgjidh një lloj burimi ose hiq identifikuesit e videos.");
  }

  const rightsBasis = optionalText(formData, "rights_basis", 500);
  if (rightsStatus === "approved" && !rightsBasis) throw new MovieValidationError("Baza e të drejtave kërkohet për një film të miratuar.");
  const genres = requiredText(formData, "genres", "Zhanret", 500).split(",").map((genre) => genre.trim()).filter(Boolean);
  if (!genres.length || genres.some((genre) => genre.length > 50)) throw new MovieValidationError("Shkruaj zhanre të vlefshme, të ndara me presje.");

  return {
    slug,
    title: requiredText(formData, "title", "Titulli", 180),
    tagline: requiredText(formData, "tagline", "Nëntitulli", 240),
    synopsis: requiredText(formData, "synopsis", "Përmbledhja", 5000),
    year: integerField(formData, "year", "Viti", 1888, 2200),
    duration_minutes: integerField(formData, "duration_minutes", "Kohëzgjatja", 1, 1440),
    age_rating: requiredText(formData, "age_rating", "Klasifikimi i moshës", 30),
    genres,
    poster_path: null,
    backdrop_path: null,
    rights_status: rightsStatus,
    rights_basis: rightsBasis,
    rights_notes: optionalText(formData, "rights_notes", 5000),
    rights_document_path: null,
    source_type: sourceType,
    internet_archive_identifier: sourceType === "internet_archive" ? archiveIdentifier : null,
    bunny_library_id: sourceType === "bunny_stream" ? bunnyLibraryId : null,
    bunny_video_id: sourceType === "bunny_stream" ? bunnyVideoId : null,
    publication_status: publicationStatus,
    featured: formData.get("featured") === "on",
    published_at: publicationStatus === "published" ? new Date().toISOString() : null,
  };
}

export function validateIdentifier(value: FormDataEntryValue | null, label: string): string {
  const id = String(value ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new MovieValidationError(`${label} nuk është i vlefshëm.`);
  }
  return id;
}
