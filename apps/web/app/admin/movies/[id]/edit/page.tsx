import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MovieForm } from "@/components/admin/movie-form";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminMovie } from "@/lib/catalogue-repository";
import { updateMovieAction } from "../../../actions";

export const metadata: Metadata = { title: "Ndrysho filmin — Administrimi" };
export const dynamic = "force-dynamic";

export default async function EditMoviePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; success?: string }> }) {
  await requireAdmin();
  const movie = await getAdminMovie((await params).id);
  if (!movie) notFound();
  const { error, success } = await searchParams;
  return <div className="admin-shell"><header className="admin-page-header"><div><p className="eyebrow">Katalogu</p><h1>Ndrysho filmin</h1><p>{movie.title}</p></div></header>{error ? <div className="admin-alert admin-alert-error" role="alert">{error}</div> : null}{success ? <div className="admin-alert admin-alert-success" role="status">{success}</div> : null}<MovieForm movie={movie} action={updateMovieAction} /></div>;
}
