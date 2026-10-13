import Link from "next/link";
import { formatDuration, type MoviePresentation } from "@/lib/catalogue-types";
import { PosterArt } from "./poster-art";

export function MovieCard({ movie }: { movie: MoviePresentation }) {
  return (
    <article className="movie-card">
      <Link href={`/movies/${movie.slug}`} aria-label={`Hap ${movie.title}`}>
        <PosterArt movie={movie} />
        <div className="card-copy">
          <h3>{movie.title}</h3>
          <p>{movie.year} · {formatDuration(movie.durationMinutes)}</p>
        </div>
      </Link>
    </article>
  );
}
