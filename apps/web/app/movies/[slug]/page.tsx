import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SafeMoviePlayer } from "@/components/player/safe-movie-player";
import { PosterArt } from "@/components/poster-art";
import { demoMovies, formatDuration, getDemoMovie } from "@/lib/demo-catalogue";
import { getPrivateTestMovie, privateTestMovies } from "@/lib/private-test-catalogue";
import { createPageMetadata } from "@/lib/site-metadata";

export function generateStaticParams() {
  return [...demoMovies, ...privateTestMovies].map((movie) => ({ slug: movie.slug }));
}

function getMovie(slug: string) {
  return getDemoMovie(slug) ?? getPrivateTestMovie(slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const movie = getMovie(slug);
  return movie ? createPageMetadata({ title: movie.title, description: movie.synopsis, path: `/movies/${slug}` }) : {};
}

export default async function MovieDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const movie = getMovie((await params).slug);
  if (!movie) notFound();
  return (
    <article className="detail-page" style={{ "--accent": movie.accent, "--shadow": movie.shadow } as React.CSSProperties}>
      <div className="detail-backdrop"><PosterArt movie={movie} wide /><div /></div>
      <div className="detail-content catalogue-shell">
        <Link className="back-link" href="/movies">← Kthehu te filmat</Link>
        <div className="detail-layout">
          <div className="detail-poster"><PosterArt movie={movie} /></div>
          <div className="detail-copy">
            <p className="eyebrow">{getPrivateTestMovie(movie.slug) ? "Test teknik · I palistuar" : "Film demonstrues · Histori imagjinare"}</p>
            <h1>{movie.title}</h1>
            <p className="detail-tagline">{movie.tagline}</p>
            <div className="meta-line"><span>{movie.year}</span><span>{formatDuration(movie.durationMinutes)}</span><span>{movie.ageRating}</span></div>
            <div className="genre-list">{movie.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
            <p className="detail-summary">{movie.synopsis}</p>
          </div>
        </div>
        <SafeMoviePlayer
          title={movie.title}
          rightsStatus={movie.rightsStatus}
          source={movie.source}
        />
      </div>
    </article>
  );
}
