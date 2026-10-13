import type { SafePlaybackInput } from "../../lib/player-policy.ts";

// Test-only values. They are deliberately not part of the public catalogue.
export const approvedInternetArchiveFixture = {
  rightsStatus: "approved",
  source: { type: "internet_archive", identifier: "test_public_domain_film_001" },
} as const satisfies SafePlaybackInput;

export const approvedMuxFixture = {
  rightsStatus: "approved",
  source: { type: "mux", playbackId: "TestMuxPlaybackId_0123456789" },
} as const satisfies SafePlaybackInput;

export const approvedBunnyStreamFixture = {
  rightsStatus: "approved",
  source: {
    type: "bunny_stream",
    libraryId: "776547",
    videoId: "05458d36-de04-4453-8536-75f063f37ab1",
  },
} as const satisfies SafePlaybackInput;
