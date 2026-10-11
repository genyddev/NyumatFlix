import type { RightsStatus } from "@/lib/player-policy";
import { isValidInternetArchiveIdentifier } from "@/lib/player-policy";
import { PlayerPlaceholder } from "../player-placeholder";

export function InternetArchivePlayer({ identifier, rightsStatus, title }: { identifier: string; rightsStatus: RightsStatus; title: string }) {
  if (rightsStatus !== "approved" || !isValidInternetArchiveIdentifier(identifier)) return <PlayerPlaceholder />;

  const playerUrl = `https://archive.org/embed/${identifier}`;

  return (
    <section className="safe-player-shell" aria-label={`Luaj ${title} nga Internet Archive`}>
      <iframe
        className="internet-archive-frame"
        src={playerUrl}
        title={`${title} — Internet Archive`}
        allow="fullscreen"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />
    </section>
  );
}
