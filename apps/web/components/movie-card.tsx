import Link from "next/link";
import { formatDuration, type DemoMovie } from "@/lib/demo-catalogue";
import { PosterArt } from "./poster-art";

export function MovieCard({ movie }: { movie: DemoMovie }) {
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
