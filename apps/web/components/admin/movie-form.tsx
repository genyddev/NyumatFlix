"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { initialMovieFormState, type MovieFormState } from "@/lib/admin-form-state";
import type { CatalogueMovie } from "@/lib/catalogue-types";
import { validateMovieUploads } from "@/lib/upload-policy";

function selectedFile(formData: FormData, name: string): File | null {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

export function MovieForm({ movie, action }: { movie?: CatalogueMovie; action: (previousState: MovieFormState, formData: FormData) => Promise<MovieFormState> }) {
  const sourceType = movie?.source?.type ?? "";
  const [uploadError, setUploadError] = useState("");
  const [actionState, dispatchAction, isPending] = useActionState(action, initialMovieFormState);

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const error = validateMovieUploads({
      poster: selectedFile(formData, "poster_file"),
      backdrop: selectedFile(formData, "backdrop_file"),
      rightsDocument: selectedFile(formData, "rights_document_file"),
    });
    setUploadError(error ?? "");
    if (!error) startTransition(() => dispatchAction(formData));
  }

  return (
    <form className="admin-movie-form" onSubmit={validateBeforeSubmit}>
      {movie ? <input type="hidden" name="id" value={movie.id} /> : null}
      {uploadError || actionState.error ? <div className="admin-alert admin-alert-error" role="alert">{uploadError || actionState.error}</div> : null}
      <section className="admin-form-section">
        <div className="admin-section-heading"><div><p className="eyebrow">Katalogu</p><h2>Të dhënat bazë</h2></div></div>
        <div className="admin-form-grid">
          <label><span>Titulli</span><input name="title" required maxLength={180} defaultValue={movie?.title} /></label>
          <label><span>Slug</span><input name="slug" required maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={movie?.slug} placeholder="titulli-i-filmit" /></label>
          <label className="admin-span-two"><span>Nëntitulli</span><input name="tagline" required maxLength={240} defaultValue={movie?.tagline} /></label>
          <label className="admin-span-two"><span>Përmbledhja</span><textarea name="synopsis" required maxLength={5000} rows={6} defaultValue={movie?.synopsis} /></label>
          <label><span>Viti</span><input name="year" type="number" min={1888} max={2200} required defaultValue={movie?.year ?? new Date().getFullYear()} /></label>
          <label><span>Kohëzgjatja (minuta)</span><input name="duration_minutes" type="number" min={1} max={1440} required defaultValue={movie?.durationMinutes ?? 90} /></label>
          <label><span>Klasifikimi i moshës</span><input name="age_rating" required maxLength={30} defaultValue={movie?.ageRating ?? "Të gjithë"} /></label>
          <label><span>Zhanret, të ndara me presje</span><input name="genres" required defaultValue={movie?.genres.join(", ")} /></label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-section-heading"><div><p className="eyebrow">Të drejtat</p><h2>Miratimi dhe burimi</h2></div><p>Asnjë URL ose iframe nuk pranohet.</p></div>
        <div className="admin-form-grid">
          <label><span>Statusi i të drejtave</span><select name="rights_status" defaultValue={movie?.rightsStatus ?? "unverified"}><option value="unverified">I paverifikuar</option><option value="approved">I miratuar</option><option value="rejected">I refuzuar</option></select></label>
          <label><span>Lloji i burimit</span><select name="source_type" defaultValue={sourceType}><option value="">Pa burim</option><option value="internet_archive">Internet Archive</option><option value="bunny_stream">Bunny Stream</option></select></label>
          <label className="admin-span-two"><span>Baza e të drejtave</span><input name="rights_basis" maxLength={500} defaultValue={movie?.rightsBasis} placeholder="P.sh. leje e shkruar, domen publik i verifikuar" /></label>
          <label className="admin-span-two"><span>Shënime private për të drejtat</span><textarea name="rights_notes" maxLength={5000} rows={4} defaultValue={movie?.rightsNotes} /></label>
          <label><span>Identifikuesi Internet Archive</span><input name="internet_archive_identifier" maxLength={100} defaultValue={movie?.source?.type === "internet_archive" ? movie.source.identifier : ""} /></label>
          <div />
          <label><span>Bunny Library ID</span><input name="bunny_library_id" inputMode="numeric" maxLength={18} defaultValue={movie?.source?.type === "bunny_stream" ? movie.source.libraryId : ""} /></label>
          <label><span>Bunny Video ID</span><input name="bunny_video_id" maxLength={36} defaultValue={movie?.source?.type === "bunny_stream" ? movie.source.videoId : ""} /></label>
          <label className="admin-span-two"><span>Dokument privat i të drejtave (PDF, JPG ose PNG, maksimumi 10 MB)</span><input name="rights_document_file" type="file" accept="application/pdf,image/jpeg,image/png" /></label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-section-heading"><div><p className="eyebrow">Pamjet</p><h2>Poster dhe sfond</h2></div></div>
        <div className="admin-form-grid">
          <label><span>Poster (JPG, PNG, WebP ose AVIF, maksimumi 5 MB)</span><input name="poster_file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
          <label><span>Sfond (JPG, PNG, WebP ose AVIF, maksimumi 5 MB)</span><input name="backdrop_file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-grid">
          <label><span>Statusi i publikimit</span><select name="publication_status" defaultValue={movie?.publicationStatus ?? "draft"}><option value="draft">Draft</option><option value="published">Publikuar</option></select></label>
          <label className="admin-checkbox"><input name="featured" type="checkbox" defaultChecked={movie?.featured} /><span>Shfaqe si film të përzgjedhur</span></label>
        </div>
      </section>
      <div className="admin-form-actions"><Link className="admin-secondary-button" href="/admin/movies">Anulo</Link><button className="primary-button" type="submit" disabled={isPending}>{isPending ? "Duke ruajtur…" : movie ? "Ruaj ndryshimet" : "Krijo filmin"}</button></div>
    </form>
  );
}
