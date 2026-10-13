import type { MovieVideoSource, RightsStatus } from "@/lib/player-policy";
import { resolveApprovedPlayback } from "@/lib/player-policy";
import { InternetArchivePlayer } from "./internet-archive-player";
import { BunnyStreamPlayer } from "./bunny-stream-player";
import { PlayerPlaceholder } from "../player-placeholder";

type SafeMoviePlayerProps = Readonly<{
  title: string;
  rightsStatus: RightsStatus;
  source: MovieVideoSource | null;
}>;

export function SafeMoviePlayer({ title, rightsStatus, source }: SafeMoviePlayerProps) {
  const approvedSource = resolveApprovedPlayback({ rightsStatus, source });
  if (approvedSource === null) return <PlayerPlaceholder />;

  switch (approvedSource.type) {
    case "internet_archive":
      return <InternetArchivePlayer identifier={approvedSource.identifier} rightsStatus="approved" title={title} />;
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
