import type { Metadata } from "next";
import { MovieForm } from "@/components/admin/movie-form";
import { requireAdmin } from "@/lib/admin-auth";
import { createMovieAction } from "../../actions";

export const metadata: Metadata = { title: "Film i ri — Administrimi" };
export const dynamic = "force-dynamic";

export default async function NewMoviePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  return <div className="admin-shell"><header className="admin-page-header"><div><p className="eyebrow">Katalogu</p><h1>Film i ri</h1></div></header>{error ? <div className="admin-alert admin-alert-error" role="alert">{error}</div> : null}<MovieForm action={createMovieAction} /></div>;
}
