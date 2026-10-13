import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MovieDetail } from "@/components/movie-detail";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminMovie } from "@/lib/catalogue-repository";

export const metadata: Metadata = { title: "Parapamja — Administrimi", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminMoviePreview({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const movie = await getAdminMovie((await params).id);
  if (!movie) notFound();
  return <MovieDetail movie={movie} eyebrow={`Parapamje private · ${movie.publicationStatus === "draft" ? "Draft" : "Publikuar"}`} backHref="/admin/movies" backLabel="Kthehu te administrimi" />;
}
