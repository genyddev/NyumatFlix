"use client";

import MuxPlayer from "@mux/mux-player-react";
import type { RightsStatus } from "@/lib/player-policy";
import { isValidMuxPlaybackId } from "@/lib/player-policy";
import { PlayerPlaceholder } from "../player-placeholder";

export function MuxMoviePlayer({ playbackId, movieId, rightsStatus, title }: { playbackId: string; movieId: string; rightsStatus: RightsStatus; title: string }) {
  if (rightsStatus !== "approved" || !isValidMuxPlaybackId(playbackId)) return <PlayerPlaceholder />;

  return (
    <section className="safe-player-shell" aria-label={`Luaj ${title} nga Mux`}>
      <MuxPlayer
        className="mux-movie-player"
        playbackId={playbackId}
        streamType="on-demand"
        preload="metadata"
        metadata={{ video_id: movieId, video_title: title }}
        accentColor="#f2a65a"
      />
    </section>
  );
}
