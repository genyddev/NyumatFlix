export type RightsStatus = "approved" | "unverified" | "rejected";

export type InternetArchiveSource = Readonly<{
  type: "internet_archive";
  identifier: string;
}>;

export type MuxSource = Readonly<{
  type: "mux";
  playbackId: string;
}>;

export type BunnyStreamSource = Readonly<{
  type: "bunny_stream";
  libraryId: string;
  videoId: string;
}>;

export type MovieVideoSource = InternetArchiveSource | MuxSource | BunnyStreamSource;

export type SafePlaybackInput = Readonly<{
  rightsStatus: RightsStatus;
  source: MovieVideoSource | null;
}>;

export type ApprovedPlayback = InternetArchiveSource | MuxSource | BunnyStreamSource;

const INTERNET_ARCHIVE_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;
const MUX_PLAYBACK_ID = /^[A-Za-z0-9_-]{20,128}$/;
const BUNNY_LIBRARY_ID = /^[1-9][0-9]{0,17}$/;
const BUNNY_VIDEO_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidInternetArchiveIdentifier(value: string): boolean {
  return INTERNET_ARCHIVE_IDENTIFIER.test(value);
}

export function isValidMuxPlaybackId(value: string): boolean {
  return MUX_PLAYBACK_ID.test(value);
}

export function isValidBunnyLibraryId(value: string): boolean {
  return BUNNY_LIBRARY_ID.test(value);
}

export function isValidBunnyVideoId(value: string): boolean {
  return BUNNY_VIDEO_ID.test(value);
}

export function resolveApprovedPlayback(input: SafePlaybackInput): ApprovedPlayback | null {
  if (input.rightsStatus !== "approved" || input.source === null) return null;

  switch (input.source.type) {
    case "internet_archive":
      return isValidInternetArchiveIdentifier(input.source.identifier) ? input.source : null;
    case "mux":
      return isValidMuxPlaybackId(input.source.playbackId) ? input.source : null;
    case "bunny_stream":
      return isValidBunnyLibraryId(input.source.libraryId) && isValidBunnyVideoId(input.source.videoId)
        ? input.source
        : null;
  }
}
