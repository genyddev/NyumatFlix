import type { DemoMovie } from "@/lib/demo-catalogue";

export function PosterArt({ movie, wide = false }: { movie: DemoMovie; wide?: boolean }) {
  return (
    <div
      className={`poster-art motif-${movie.motif}${wide ? " poster-art-wide" : ""}`}
      style={{ "--accent": movie.accent, "--shadow": movie.shadow } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className="poster-grain" />
      <span className="poster-symbol" />
      <span className="poster-wordmark">UF</span>
      {!wide && <span className="poster-title">{movie.title}</span>}
    </div>
  );
}
