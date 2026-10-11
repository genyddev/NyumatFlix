export type RightsStatus = "approved" | "unverified" | "rejected";

export type InternetArchiveSource = Readonly<{
  type: "internet_archive";
  identifier: string;
}>;

export type MuxSource = Readonly<{
  type: "mux";
  playbackId: string;
}>;

export type MovieVideoSource = InternetArchiveSource | MuxSource;

export type SafePlaybackInput = Readonly<{
  rightsStatus: RightsStatus;
  source: MovieVideoSource | null;
}>;

export type ApprovedPlayback = InternetArchiveSource | MuxSource;

const INTERNET_ARCHIVE_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;
const MUX_PLAYBACK_ID = /^[A-Za-z0-9_-]{20,128}$/;

export function isValidInternetArchiveIdentifier(value: string): boolean {
  return INTERNET_ARCHIVE_IDENTIFIER.test(value);
}

export function isValidMuxPlaybackId(value: string): boolean {
  return MUX_PLAYBACK_ID.test(value);
}

export function resolveApprovedPlayback(input: SafePlaybackInput): ApprovedPlayback | null {
  if (input.rightsStatus !== "approved" || input.source === null) return null;

  switch (input.source.type) {
    case "internet_archive":
      return isValidInternetArchiveIdentifier(input.source.identifier) ? input.source : null;
    case "mux":
      return isValidMuxPlaybackId(input.source.playbackId) ? input.source : null;
  }
}
