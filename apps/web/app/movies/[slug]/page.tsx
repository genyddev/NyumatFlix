import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MovieDetail } from "@/components/movie-detail";
import { getPublicMovie } from "@/lib/catalogue-repository";
import { createPageMetadata } from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const movie = await getPublicMovie(slug);
  return movie ? createPageMetadata({ title: movie.title, description: movie.synopsis, path: `/movies/${slug}` }) : {};
}

export default async function MovieDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const movie = await getPublicMovie((await params).slug);
  if (!movie) notFound();
  return <MovieDetail movie={movie} eyebrow="KokoMax" />;
}
