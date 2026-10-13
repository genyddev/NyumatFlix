import type { Metadata } from "next";
import { MovieCard } from "@/components/movie-card";
import { demoMovies } from "@/lib/demo-catalogue";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Filma",
  description: "Shfleto katalogun demonstrues të KokoMax me histori dhe tituj imagjinarë.",
  path: "/movies",
});

export default function MoviesPage() {
  return (
    <div className="catalogue-shell page-shell">
      <header className="page-heading"><p className="eyebrow">Katalogu demonstrues</p><h1>Filma</h1><p>Një koleksion i vogël me histori dhe pamje imagjinare, i ruajtur tërësisht në këtë projekt.</p></header>
      <div className="movie-grid">{demoMovies.map((movie) => <MovieCard key={movie.slug} movie={movie} />)}</div>
    </div>
  );
}
