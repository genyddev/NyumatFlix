"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import type { MovieUpdate } from "@/lib/database.types";
import { MovieValidationError, parseMovieForm, validateIdentifier } from "@/lib/movie-validation";
import { hasSupabaseEnvironment } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { authClient } from "@/lib/supabase/auth";

const IMAGE_TYPES = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["image/avif", "avif"]]);
const RIGHTS_TYPES = new Map([["application/pdf", "pdf"], ["image/jpeg", "jpg"], ["image/png", "png"]]);

function adminRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function optionalFile(formData: FormData, field: string): File | null {
  const value = formData.get(field);
  return value instanceof File && value.size > 0 ? value : null;
}

function validateFile(file: File | null, allowed: ReadonlyMap<string, string>, maxBytes: number, label: string) {
  if (!file) return;
  if (file.size > maxBytes) throw new MovieValidationError(`${label} tejkalon kufirin prej ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  if (!allowed.has(file.type)) throw new MovieValidationError(`${label} ka format të palejuar.`);
}

async function uploadFiles(movieId: string, formData: FormData): Promise<MovieUpdate> {
  const poster = optionalFile(formData, "poster_file");
  const backdrop = optionalFile(formData, "backdrop_file");
  const rightsDocument = optionalFile(formData, "rights_document_file");
  validateFile(poster, IMAGE_TYPES, 5 * 1024 * 1024, "Posteri");
  validateFile(backdrop, IMAGE_TYPES, 5 * 1024 * 1024, "Sfondi");
  validateFile(rightsDocument, RIGHTS_TYPES, 10 * 1024 * 1024, "Dokumenti i të drejtave");

  const supabase = await createServerSupabaseClient();
  const updates: MovieUpdate = {};
  for (const [file, bucket, folder, field, types] of [
    [poster, "catalogue-media", "posters", "poster_path", IMAGE_TYPES],
    [backdrop, "catalogue-media", "backdrops", "backdrop_path", IMAGE_TYPES],
    [rightsDocument, "rights-documents", "documents", "rights_document_path", RIGHTS_TYPES],
  ] as const) {
    if (!file) continue;
    const path = `${folder}/${movieId}/${randomUUID()}.${types.get(file.type)}`;
    const { error } = await supabase.storage.from(bucket).upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
    if (error) throw new MovieValidationError(`Ngarkimi i skedarit dështoi: ${error.message}`);
    updates[field] = path;
  }
  return updates;
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

export async function createMovieAction(formData: FormData) {
  await requireAdmin();
  try {
    const movie = parseMovieForm(formData);
    validateFile(optionalFile(formData, "poster_file"), IMAGE_TYPES, 5 * 1024 * 1024, "Posteri");
    validateFile(optionalFile(formData, "backdrop_file"), IMAGE_TYPES, 5 * 1024 * 1024, "Sfondi");
    validateFile(optionalFile(formData, "rights_document_file"), RIGHTS_TYPES, 10 * 1024 * 1024, "Dokumenti i të drejtave");
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("movies").insert(movie).select("id").single();
    if (error || !data) throw new MovieValidationError(error?.code === "23505" ? "Ky slug ekziston tashmë." : "Filmi nuk mund të ruhej.");
    const fileUpdates = await uploadFiles(data.id, formData);
    if (Object.keys(fileUpdates).length) {
      const { error: fileUpdateError } = await supabase.from("movies").update(fileUpdates).eq("id", data.id);
      if (fileUpdateError) throw new MovieValidationError("Filmi u ruajt, por lidhja e skedarëve dështoi.");
    }
    refreshCatalogue();
    redirect(`/admin/movies/${data.id}/edit?success=${encodeURIComponent("Filmi u krijua.")}`);
  } catch (error) {
    if (error instanceof MovieValidationError) adminRedirect("/admin/movies/new", error.message);
    throw error;
  }
}

export async function updateMovieAction(formData: FormData) {
  await requireAdmin();
  const id = validateIdentifier(formData.get("id"), "ID-ja e filmit");
  try {
    const parsed = parseMovieForm(formData);
    const supabase = await createServerSupabaseClient();
    const current = await supabase.from("movies").select("poster_path,backdrop_path,rights_document_path,published_at").eq("id", id).single();
    if (current.error || !current.data) throw new MovieValidationError("Filmi nuk u gjet.");
    const uploads = await uploadFiles(id, formData);
    const update: MovieUpdate = {
      ...parsed,
      poster_path: uploads.poster_path ?? current.data.poster_path,
      backdrop_path: uploads.backdrop_path ?? current.data.backdrop_path,
      rights_document_path: uploads.rights_document_path ?? current.data.rights_document_path,
      published_at: parsed.publication_status === "published" ? current.data.published_at ?? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("movies").update(update).eq("id", id);
    if (error) throw new MovieValidationError(error.code === "23505" ? "Ky slug ekziston tashmë." : "Ndryshimet nuk mund të ruheshin.");
    refreshCatalogue();
    redirect(`/admin/movies/${id}/edit?success=${encodeURIComponent("Ndryshimet u ruajtën.")}`);
  } catch (error) {
    if (error instanceof MovieValidationError) adminRedirect(`/admin/movies/${id}/edit`, error.message);
    throw error;
  }
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
