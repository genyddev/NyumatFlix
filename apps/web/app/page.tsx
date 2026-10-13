import type { Metadata } from "next";
import Link from "next/link";
import { MovieRow } from "@/components/movie-row";
import { PosterArt } from "@/components/poster-art";
import { catalogueRows, featuredMovie, formatDuration, getMoviesBySlug } from "@/lib/demo-catalogue";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata();

export default function HomePage() {
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
        <div className="demo-note"><span>Demonstrim lokal</span> Të gjithë titujt dhe përshkrimet janë imagjinarë.</div>
        {catalogueRows.map((row) => <MovieRow key={row.title} title={row.title} movies={getMoviesBySlug(row.slugs)} />)}
      </div>
    </>
  );
}
