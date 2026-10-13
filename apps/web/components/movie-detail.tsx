import Link from "next/link";
import type { MoviePresentation } from "@/lib/catalogue-types";
import { formatDuration } from "@/lib/catalogue-types";
import { SafeMoviePlayer } from "./player/safe-movie-player";
import { PosterArt } from "./poster-art";

export function MovieDetail({ movie, eyebrow, backHref = "/movies", backLabel = "Kthehu te filmat" }: {
  movie: MoviePresentation;
  eyebrow: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <article className="detail-page" style={{ "--accent": movie.accent, "--shadow": movie.shadow } as React.CSSProperties}>
      <div className="detail-backdrop"><PosterArt movie={movie} wide /><div /></div>
      <div className="detail-content catalogue-shell">
        <Link className="back-link" href={backHref}>← {backLabel}</Link>
        <div className="detail-layout">
          <div className="detail-poster"><PosterArt movie={movie} /></div>
          <div className="detail-copy">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{movie.title}</h1>
            <p className="detail-tagline">{movie.tagline}</p>
            <div className="meta-line"><span>{movie.year}</span><span>{formatDuration(movie.durationMinutes)}</span><span>{movie.ageRating}</span></div>
            <div className="genre-list">{movie.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
            <p className="detail-summary">{movie.synopsis}</p>
          </div>
        </div>
        <SafeMoviePlayer title={movie.title} rightsStatus={movie.rightsStatus} source={movie.source} />
      </div>
    </article>
  );
}
