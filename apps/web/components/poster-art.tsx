import type { MoviePresentation } from "@/lib/catalogue-types";

export function PosterArt({ movie, wide = false }: { movie: MoviePresentation; wide?: boolean }) {
  const imageUrl = wide ? movie.backdropUrl : movie.posterUrl;
  return (
    <div
      className={`poster-art motif-${movie.motif}${wide ? " poster-art-wide" : ""}`}
      style={{ "--accent": movie.accent, "--shadow": movie.shadow } as React.CSSProperties}
      aria-hidden="true"
    >
      {imageUrl ? <img className="poster-image" src={imageUrl} alt="" /> : null}
      <span className="poster-grain" />
      <span className="poster-symbol" />
      <span className="poster-wordmark">UF</span>
      {!wide && <span className="poster-title">{movie.title}</span>}
    </div>
  );
}
