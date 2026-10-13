import type { Metadata } from "next";
import Link from "next/link";
import { MovieRow } from "@/components/movie-row";
import { PosterArt } from "@/components/poster-art";
import { formatDuration } from "@/lib/catalogue-types";
import { listPublicMovies } from "@/lib/catalogue-repository";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata();
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const movies = await listPublicMovies();
  const featuredMovie = movies.find((movie) => movie.featured) ?? movies[0];
  if (!featuredMovie) {
    return (
      <div className="catalogue-shell page-shell safe-empty-catalogue">
        <p className="eyebrow">KokoMax</p>
        <h1>Katalogu po përgatitet.</h1>
        <p>Nuk ka ende filma të miratuar dhe të publikuar. Regjistrimet draft ose të paverifikuara nuk shfaqen publikisht.</p>
      </div>
    );
  }
  const remaining = movies.filter((movie) => movie.id !== featuredMovie.id);
  return (
    <>
      <section className="hero" style={{ "--accent": featuredMovie.accent, "--shadow": featuredMovie.shadow } as React.CSSProperties}>
        <div className="hero-art"><PosterArt movie={featuredMovie} wide /></div>
        <div className="hero-vignette" />
        <div className="hero-content">
          <p className="eyebrow">Përzgjedhja e javës</p>
          <h1>{featuredMovie.title}</h1>
          <p className="hero-tagline">{featuredMovie.tagline}</p>
          <div className="meta-line">
            <span>{featuredMovie.year}</span><span>{formatDuration(featuredMovie.durationMinutes)}</span><span>{featuredMovie.ageRating}</span>
          </div>
          <p className="hero-summary">{featuredMovie.synopsis}</p>
          <div className="hero-actions">
            <Link className="primary-button" href={`/movies/${featuredMovie.slug}`}>Shiko detajet</Link>
            <Link className="secondary-button" href="/movies">Shfleto katalogun</Link>
          </div>
        </div>
      </section>
      <div className="catalogue-shell home-rows">
        <MovieRow title="Të përzgjedhurat" movies={[featuredMovie, ...remaining.slice(0, 5)]} />
        {remaining.length > 5 ? <MovieRow title="Histori për t’u zbuluar" movies={remaining.slice(5)} /> : null}
      </div>
    </>
  );
}
