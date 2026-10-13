import type { MovieVideoSource, RightsStatus } from "@/lib/player-policy";
import { resolveApprovedPlayback } from "@/lib/player-policy";
import { InternetArchivePlayer } from "./internet-archive-player";
import { MuxMoviePlayer } from "./mux-movie-player";
import { BunnyStreamPlayer } from "./bunny-stream-player";
import { PlayerPlaceholder } from "../player-placeholder";

type SafeMoviePlayerProps = Readonly<{
  movieId: string;
  title: string;
  rightsStatus: RightsStatus;
  source: MovieVideoSource | null;
}>;

export function SafeMoviePlayer({ movieId, title, rightsStatus, source }: SafeMoviePlayerProps) {
  const approvedSource = resolveApprovedPlayback({ rightsStatus, source });
  if (approvedSource === null) return <PlayerPlaceholder />;

  switch (approvedSource.type) {
    case "internet_archive":
      return <InternetArchivePlayer identifier={approvedSource.identifier} rightsStatus="approved" title={title} />;
    case "mux":
      return <MuxMoviePlayer playbackId={approvedSource.playbackId} movieId={movieId} rightsStatus="approved" title={title} />;
    case "bunny_stream":
      return (
        <BunnyStreamPlayer
          libraryId={approvedSource.libraryId}
          videoId={approvedSource.videoId}
          rightsStatus="approved"
          title={title}
        />
      );
  }
}
