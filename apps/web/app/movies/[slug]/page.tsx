import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayerPlaceholder } from "@/components/player-placeholder";
import { PosterArt } from "@/components/poster-art";
import { demoMovies, formatDuration, getDemoMovie } from "@/lib/demo-catalogue";

export function generateStaticParams() { return demoMovies.map((movie) => ({ slug: movie.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const movie = getDemoMovie((await params).slug);
  return movie ? { title: movie.title, description: movie.synopsis } : {};
}

export default async function MovieDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const movie = getDemoMovie((await params).slug);
  if (!movie) notFound();
  return (
    <article className="detail-page" style={{ "--accent": movie.accent, "--shadow": movie.shadow } as React.CSSProperties}>
      <div className="detail-backdrop"><PosterArt movie={movie} wide /><div /></div>
      <div className="detail-content catalogue-shell">
        <Link className="back-link" href="/movies">← Kthehu te filmat</Link>
        <div className="detail-layout">
          <div className="detail-poster"><PosterArt movie={movie} /></div>
          <div className="detail-copy">
            <p className="eyebrow">Film demonstrues · Histori imagjinare</p>
            <h1>{movie.title}</h1>
            <p className="detail-tagline">{movie.tagline}</p>
            <div className="meta-line"><span>{movie.year}</span><span>{formatDuration(movie.durationMinutes)}</span><span>{movie.ageRating}</span></div>
            <div className="genre-list">{movie.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
            <p className="detail-summary">{movie.synopsis}</p>
          </div>
        </div>
        <PlayerPlaceholder />
      </div>
    </article>
  );
}
