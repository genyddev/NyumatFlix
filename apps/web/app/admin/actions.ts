"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import type { MovieFormState } from "@/lib/admin-form-state";
import type { MovieUpdate } from "@/lib/database.types";
import { MovieValidationError, parseMovieForm, validateIdentifier } from "@/lib/movie-validation";
import { hasSupabaseEnvironment } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { authClient } from "@/lib/supabase/auth";
import {
  IMAGE_UPLOAD_TYPES,
  RIGHTS_DOCUMENT_TYPES,
  validateMovieUploads,
  type MovieUploadSet,
} from "@/lib/upload-policy";

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;
type UploadedObject = Readonly<{ bucket: "catalogue-media" | "rights-documents"; path: string }>;

function adminRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function optionalFile(formData: FormData, field: string): File | null {
  const value = formData.get(field);
  return value instanceof File && value.size > 0 ? value : null;
}

function movieUploadSet(formData: FormData): MovieUploadSet {
  return {
    poster: optionalFile(formData, "poster_file"),
    backdrop: optionalFile(formData, "backdrop_file"),
    rightsDocument: optionalFile(formData, "rights_document_file"),
  };
}

async function removeUploadedObjects(supabase: ServerSupabaseClient, uploaded: readonly UploadedObject[]) {
  for (const bucket of ["catalogue-media", "rights-documents"] as const) {
    const paths = uploaded.filter((item) => item.bucket === bucket).map((item) => item.path);
    if (paths.length) await supabase.storage.from(bucket).remove(paths);
  }
}

async function uploadFiles(supabase: ServerSupabaseClient, movieId: string, formData: FormData): Promise<{ updates: MovieUpdate; uploaded: UploadedObject[] }> {
  const files = movieUploadSet(formData);
  const validationError = validateMovieUploads(files);
  if (validationError) throw new MovieValidationError(validationError);
  const updates: MovieUpdate = {};
  const uploaded: UploadedObject[] = [];
  try {
    for (const [file, bucket, folder, field, types] of [
      [files.poster, "catalogue-media", "posters", "poster_path", IMAGE_UPLOAD_TYPES],
      [files.backdrop, "catalogue-media", "backdrops", "backdrop_path", IMAGE_UPLOAD_TYPES],
      [files.rightsDocument, "rights-documents", "documents", "rights_document_path", RIGHTS_DOCUMENT_TYPES],
    ] as const) {
      if (!file) continue;
      const path = `${folder}/${movieId}/${randomUUID()}.${types.get(file.type)}`;
      const { error } = await supabase.storage.from(bucket).upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
      if (error) throw new MovieValidationError(`Ngarkimi i skedarit dështoi: ${error.message}`);
      uploaded.push({ bucket, path });
      updates[field] = path;
    }
    return { updates, uploaded };
  } catch (error) {
    await removeUploadedObjects(supabase, uploaded);
    throw error;
  }
}

function refreshCatalogue() {
  revalidatePath("/");
  revalidatePath("/movies");
  revalidatePath("/search");
  revalidatePath("/admin/movies");
}

export async function loginAction(formData: FormData) {
  if (!hasSupabaseEnvironment()) adminRedirect("/admin", "Supabase nuk është konfiguruar ende.");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) adminRedirect("/admin", "Shkruaj emailin dhe fjalëkalimin.");
  const supabase = await createServerSupabaseClient();
  const auth = authClient(supabase);
  const { data, error } = await auth.signInWithPassword({ email, password });
  if (error || !data.user) adminRedirect("/admin", "Emaili ose fjalëkalimi nuk është i saktë.");
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await auth.signOut();
    adminRedirect("/admin", "Kjo llogari nuk ka leje administratori.");
  }
  redirect("/admin/movies");
}

export async function logoutAction() {
  if (hasSupabaseEnvironment()) {
    const supabase = await createServerSupabaseClient();
    await authClient(supabase).signOut();
  }
  redirect("/admin");
}

export async function createMovieAction(_previousState: MovieFormState, formData: FormData): Promise<MovieFormState> {
  await requireAdmin();
  let createdId = "";
  let rollbackUploads: (() => Promise<void>) | null = null;
  try {
    const movie = parseMovieForm(formData);
    const supabase = await createServerSupabaseClient();
    createdId = randomUUID();
    const uploads = await uploadFiles(supabase, createdId, formData);
    rollbackUploads = () => removeUploadedObjects(supabase, uploads.uploaded);
    const { error } = await supabase.from("movies").insert({ ...movie, id: createdId, ...uploads.updates });
    if (error) {
      throw new MovieValidationError(error.code === "23505" ? "Ky slug ekziston tashmë." : "Filmi nuk mund të ruhej.");
    }
    rollbackUploads = null;
  } catch (error) {
    if (rollbackUploads) await rollbackUploads();
    return { error: error instanceof MovieValidationError ? error.message : "Filmi nuk mund të ruhej. Provo përsëri." };
  }
  refreshCatalogue();
  redirect(`/admin/movies/${createdId}/edit?success=${encodeURIComponent("Filmi u krijua.")}`);
}

export async function updateMovieAction(_previousState: MovieFormState, formData: FormData): Promise<MovieFormState> {
  await requireAdmin();
  const id = validateIdentifier(formData.get("id"), "ID-ja e filmit");
  let rollbackUploads: (() => Promise<void>) | null = null;
  try {
    const parsed = parseMovieForm(formData);
    const supabase = await createServerSupabaseClient();
    const current = await supabase.from("movies").select("poster_path,backdrop_path,rights_document_path,published_at").eq("id", id).single();
    if (current.error || !current.data) throw new MovieValidationError("Filmi nuk u gjet.");
    const uploads = await uploadFiles(supabase, id, formData);
    rollbackUploads = () => removeUploadedObjects(supabase, uploads.uploaded);
    const update: MovieUpdate = {
      ...parsed,
      poster_path: uploads.updates.poster_path ?? current.data.poster_path,
      backdrop_path: uploads.updates.backdrop_path ?? current.data.backdrop_path,
      rights_document_path: uploads.updates.rights_document_path ?? current.data.rights_document_path,
      published_at: parsed.publication_status === "published" ? current.data.published_at ?? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("movies").update(update).eq("id", id);
    if (error) {
      throw new MovieValidationError(error.code === "23505" ? "Ky slug ekziston tashmë." : "Ndryshimet nuk mund të ruheshin.");
    }
    rollbackUploads = null;
    const replaced: UploadedObject[] = [];
    if (uploads.updates.poster_path && current.data.poster_path) replaced.push({ bucket: "catalogue-media", path: current.data.poster_path });
    if (uploads.updates.backdrop_path && current.data.backdrop_path) replaced.push({ bucket: "catalogue-media", path: current.data.backdrop_path });
    if (uploads.updates.rights_document_path && current.data.rights_document_path) replaced.push({ bucket: "rights-documents", path: current.data.rights_document_path });
    await removeUploadedObjects(supabase, replaced);
  } catch (error) {
    if (rollbackUploads) await rollbackUploads();
    return { error: error instanceof MovieValidationError ? error.message : "Ndryshimet nuk mund të ruheshin. Provo përsëri." };
  }
  refreshCatalogue();
  redirect(`/admin/movies/${id}/edit?success=${encodeURIComponent("Ndryshimet u ruajtën.")}`);
}

export async function setPublicationAction(formData: FormData) {
  await requireAdmin();
  const id = validateIdentifier(formData.get("id"), "ID-ja e filmit");
  const operation = String(formData.get("operation"));
  const supabase = await createServerSupabaseClient();
  if (operation === "publish") {
    const { data: movie } = await supabase.from("movies").select("rights_status").eq("id", id).single();
    if (!movie || movie.rights_status !== "approved") adminRedirect("/admin/movies", "Filmi duhet të ketë të drejta të miratuara para publikimit.");
    const { error } = await supabase.from("movies").update({ publication_status: "published", published_at: new Date().toISOString() }).eq("id", id);
    if (error) adminRedirect("/admin/movies", "Filmi nuk mund të publikohej.");
  } else if (operation === "unpublish") {
    const { error } = await supabase.from("movies").update({ publication_status: "draft", published_at: null }).eq("id", id);
    if (error) adminRedirect("/admin/movies", "Filmi nuk mund të hiqej nga publikimi.");
  } else {
    adminRedirect("/admin/movies", "Veprimi nuk është i vlefshëm.");
  }
  refreshCatalogue();
  redirect("/admin/movies");
}

export async function deleteMovieAction(formData: FormData) {
  await requireAdmin();
  const id = validateIdentifier(formData.get("id"), "ID-ja e filmit");
  const supabase = await createServerSupabaseClient();
  const { data: movie } = await supabase
    .from("movies")
    .select("poster_path,backdrop_path,rights_document_path")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("movies").delete().eq("id", id);
  if (error) adminRedirect("/admin/movies", "Filmi nuk mund të fshihej.");
  if (movie?.poster_path || movie?.backdrop_path) {
    await supabase.storage.from("catalogue-media").remove([movie.poster_path, movie.backdrop_path].filter((path): path is string => Boolean(path)));
  }
  if (movie?.rights_document_path) await supabase.storage.from("rights-documents").remove([movie.rights_document_path]);
  refreshCatalogue();
  redirect("/admin/movies");
}
