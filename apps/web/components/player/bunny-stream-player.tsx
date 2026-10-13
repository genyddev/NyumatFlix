import type { RightsStatus } from "@/lib/player-policy";
import { isValidBunnyLibraryId, isValidBunnyVideoId } from "@/lib/player-policy";
import { PlayerPlaceholder } from "../player-placeholder";

type BunnyStreamPlayerProps = Readonly<{
  libraryId: string;
  videoId: string;
  rightsStatus: RightsStatus;
  title: string;
}>;

export function BunnyStreamPlayer({ libraryId, videoId, rightsStatus, title }: BunnyStreamPlayerProps) {
  if (rightsStatus !== "approved" || !isValidBunnyLibraryId(libraryId) || !isValidBunnyVideoId(videoId)) {
    return <PlayerPlaceholder />;
  }

  const playerUrl = `https://player.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&muted=false`;

  return (
    <section className="safe-player-shell" aria-label={`Luaj ${title} nga Bunny Stream`}>
      <iframe
        className="bunny-stream-frame"
        src={playerUrl}
        title={`${title} — Bunny Stream`}
        allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </section>
  );
}
