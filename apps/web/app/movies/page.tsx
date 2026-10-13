import type { Metadata } from "next";
import { MovieCard } from "@/components/movie-card";
import { listPublicMovies } from "@/lib/catalogue-repository";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Filma",
  description: "Shfleto katalogun demonstrues të KokoMax me histori dhe tituj imagjinarë.",
  path: "/movies",
});
export const dynamic = "force-dynamic";

export default async function MoviesPage() {
  const movies = await listPublicMovies();
  return (
    <div className="catalogue-shell page-shell">
      <header className="page-heading"><p className="eyebrow">Katalogu demonstrues</p><h1>Filma</h1><p>Një koleksion i vogël me histori dhe pamje imagjinare, i ruajtur tërësisht në këtë projekt.</p></header>
      {movies.length ? <div className="movie-grid">{movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div> : <div className="empty-state"><h2>Nuk ka filma publikë.</h2><p>Vetëm filmat e miratuar dhe të publikuar shfaqen këtu.</p></div>}
    </div>
  );
}
