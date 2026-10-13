import type { Metadata } from "next";
import Link from "next/link";
import { DeleteMovieForm } from "@/components/admin/delete-movie-form";
import { requireAdmin } from "@/lib/admin-auth";
import { listAdminMovies } from "@/lib/catalogue-repository";
import { deleteMovieAction, logoutAction, setPublicationAction } from "../actions";

export const metadata: Metadata = { title: "Filmat — Administrimi" };
export const dynamic = "force-dynamic";

export default async function AdminMoviesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const admin = await requireAdmin();
  const movies = await listAdminMovies();
  const { error } = await searchParams;
  return (
    <div className="admin-shell">
      <header className="admin-page-header"><div><p className="eyebrow">KokoMax Admin</p><h1>Filmat</h1><p>{admin.email ?? "Administrator"}</p></div><div className="admin-header-actions"><Link className="primary-button" href="/admin/movies/new">Film i ri</Link><form action={logoutAction}><button className="admin-secondary-button" type="submit">Dil</button></form></div></header>
      {error ? <div className="admin-alert admin-alert-error" role="alert">{error}</div> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Filmi</th><th>Të drejtat</th><th>Publikimi</th><th>Burimi</th><th>Veprime</th></tr></thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie.id}>
                <td><strong>{movie.title}</strong><small>{movie.slug}</small>{movie.featured ? <span className="admin-badge">I përzgjedhur</span> : null}</td>
                <td><span className={`admin-status status-${movie.rightsStatus}`}>{movie.rightsStatus === "approved" ? "I miratuar" : movie.rightsStatus === "rejected" ? "I refuzuar" : "I paverifikuar"}</span></td>
                <td>{movie.publicationStatus === "published" ? "Publikuar" : "Draft"}</td>
                <td>{movie.source?.type === "bunny_stream" ? "Bunny Stream" : movie.source?.type === "internet_archive" ? "Internet Archive" : "Pa burim"}</td>
                <td><div className="admin-row-actions"><Link href={`/admin/movies/${movie.id}/edit`}>Ndrysho</Link><Link href={`/admin/movies/${movie.id}/preview`}>Parapamje</Link><form action={setPublicationAction}><input type="hidden" name="id" value={movie.id} /><input type="hidden" name="operation" value={movie.publicationStatus === "published" ? "unpublish" : "publish"} /><button type="submit">{movie.publicationStatus === "published" ? "Çpubliko" : "Publiko"}</button></form><DeleteMovieForm id={movie.id} action={deleteMovieAction} /></div></td>
              </tr>
            ))}
            {!movies.length ? <tr><td colSpan={5}><div className="empty-state"><h2>Nuk ka ende filma.</h2><p>Krijo regjistrimin e parë si draft.</p></div></td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
