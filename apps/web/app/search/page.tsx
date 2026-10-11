import type { Metadata } from "next";
import { MovieCard } from "@/components/movie-card";
import { searchDemoMovies } from "@/lib/demo-catalogue";

export const metadata: Metadata = { title: "Kërko" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = searchDemoMovies(q);
  return (
    <div className="catalogue-shell page-shell search-page">
      <header className="page-heading"><p className="eyebrow">Gjej një histori</p><h1>Kërko filma</h1></header>
      <form className="search-panel" action="/search" role="search">
        <label htmlFor="catalogue-query">Titull, zhanër ose fjalë kyçe</label>
        <div><input id="catalogue-query" name="q" defaultValue={q} placeholder="P.sh. mister, qytet, dramë..." autoFocus /><button type="submit">Kërko</button></div>
      </form>
      <div className="results-heading"><h2>{q ? `Rezultatet për “${q}”` : "Të gjithë filmat"}</h2><span>{results.length} rezultate</span></div>
      {results.length > 0 ? <div className="movie-grid">{results.map((movie) => <MovieCard key={movie.slug} movie={movie} />)}</div> : <div className="empty-state"><h2>Nuk u gjet asnjë film.</h2><p>Provo një titull ose zhanër tjetër nga katalogu demonstrues.</p></div>}
    </div>
  );
}
