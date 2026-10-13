import type { MoviePresentation } from "@/lib/catalogue-types";
import { MovieCard } from "./movie-card";

export function MovieRow({ title, movies }: { title: string; movies: readonly MoviePresentation[] }) {
  return (
    <section className="content-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <span>{movies.length} filma</span>
      </div>
      <div className="movie-row">
        {movies.map((movie) => <MovieCard key={movie.slug} movie={movie} />)}
      </div>
    </section>
  );
}
