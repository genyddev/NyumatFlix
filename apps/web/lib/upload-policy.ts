export const MEBIBYTE = 1024 * 1024;
export const POSTER_MAX_BYTES = 5 * MEBIBYTE;
export const BACKDROP_MAX_BYTES = 5 * MEBIBYTE;
export const RIGHTS_DOCUMENT_MAX_BYTES = 10 * MEBIBYTE;
export const COMBINED_UPLOAD_MAX_BYTES = POSTER_MAX_BYTES + BACKDROP_MAX_BYTES + RIGHTS_DOCUMENT_MAX_BYTES;
export const SERVER_ACTION_BODY_SIZE_LIMIT = "22mb";

export const IMAGE_UPLOAD_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export const RIGHTS_DOCUMENT_TYPES = new Map([
  ["application/pdf", "pdf"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

export type UploadCandidate = Readonly<Pick<File, "size" | "type" | "arrayBuffer">> | null;

export type MovieUploadSet = Readonly<{
  poster: UploadCandidate;
  backdrop: UploadCandidate;
  rightsDocument: UploadCandidate;
}>;

function validateCandidate(
  file: UploadCandidate,
  allowed: ReadonlyMap<string, string>,
  maxBytes: number,
  label: string,
): string | null {
  if (!file || file.size === 0) return null;
  if (file.size > maxBytes) return `${label} tejkalon kufirin prej ${Math.round(maxBytes / MEBIBYTE)} MB.`;
  if (!allowed.has(file.type)) return `${label} ka format të palejuar.`;
  return null;
}

export function validateMovieUploads(files: MovieUploadSet): string | null {
  const individualError =
    validateCandidate(files.poster, IMAGE_UPLOAD_TYPES, POSTER_MAX_BYTES, "Posteri")
    ?? validateCandidate(files.backdrop, IMAGE_UPLOAD_TYPES, BACKDROP_MAX_BYTES, "Sfondi")
    ?? validateCandidate(files.rightsDocument, RIGHTS_DOCUMENT_TYPES, RIGHTS_DOCUMENT_MAX_BYTES, "Dokumenti i të drejtave");
  if (individualError) return individualError;

  const combinedBytes = [files.poster, files.backdrop, files.rightsDocument]
    .reduce((total, file) => total + (file?.size ?? 0), 0);
  if (combinedBytes > COMBINED_UPLOAD_MAX_BYTES) {
    return "Skedarët së bashku tejkalojnë kufirin prej 20 MB.";
  }
  return null;
}
