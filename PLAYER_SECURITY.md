# Safe movie player architecture

The runtime recognizes exactly three source discriminators:

- `internet_archive` with a validated Internet Archive identifier.
- `mux` with a validated Mux playback ID.
- `bunny_stream` with a validated numeric Bunny library ID and UUID video ID.

`SafeMoviePlayer` refuses playback unless the movie has `rightsStatus: "approved"`. `unverified`, `rejected`, missing, and malformed sources render the Albanian safe placeholder. All fictional public demonstration records are unverified and have no source.

## Internet Archive

The application accepts an identifier containing only ASCII letters, numbers, period, underscore, and hyphen, with a maximum length of 100 characters. It constructs `https://archive.org/embed/{identifier}` internally and never accepts an Archive URL, file URL, iframe fragment, query string, or HTML. The resulting iframe is sandboxed and the parent CSP permits frames only from `https://archive.org`.

An Archive item must be manually verified as public domain and marked approved before its identifier is added. Presence on Internet Archive alone is not treated as proof of public-domain status.

## Mux

The application uses Mux’s official React package, `@mux/mux-player-react`. Browser code receives only an allowlisted playback ID composed of letters, numbers, underscore, and hyphen. URLs, query strings, signed tokens, API secrets, upload credentials, and asset-management identifiers are not accepted.

Mux documents that its player may use multiple CDN subdomains. For that reason, and only for playback compatibility, the CSP narrowly permits:

- `connect-src https://*.mux.com https://*.litix.io`
- `media-src blob: https://*.mux.com`
- `img-src https://image.mux.com https://*.litix.io`
- `worker-src blob:`

The scoped `*.mux.com` wildcard is required by Mux’s official playback CSP guidance because manifests and segments can be served from multiple Mux CDN subdomains. The scoped `*.litix.io` wildcard supports Mux Player’s bundled playback telemetry. The package is bundled locally, so no remote script origin is allowed.

Official references:

- https://www.mux.com/docs/core/content-security-policy
- https://www.mux.com/docs/guides/player-integrate-in-your-webapp
- https://www.mux.com/docs/guides/player-api-reference/react

## Explicitly excluded

- No video upload UI, upload API, Mux secret, signing credential, or Google Cloud Storage upload origin.
- No Bunny upload or management API, API key, access key, signing secret, or token-generation code.
- No R2 movie storage.
- No YouTube player or origin.
- No arbitrary media URL, iframe HTML, provider fallback, provider discovery, proxy, or scraper.

Initial Mux uploads are performed manually in the Mux dashboard. A playback ID can be added to the catalogue only after written streaming permission has been recorded and the movie is marked approved.

## Bunny Stream

The application accepts only a numeric library ID and a UUID-shaped video ID. `BunnyStreamPlayer` constructs the official embed URL internally on the exact `https://player.mediadelivery.net` origin. It explicitly sets `autoplay=false` and `muted=false`, does not grant the iframe autoplay permission, and never accepts iframe HTML or a caller-supplied URL.

The parent CSP adds only `https://player.mediadelivery.net` to `frame-src`; it does not add a Bunny wildcard, API origin, storage hostname, or direct media origin. Playback through Bunny's hosted iframe needs no API key. No Bunny API key, upload credential, or management endpoint exists in browser or server code.

Official reference:

- https://github.com/BunnyWay/documentation/blob/main/stream/embedding.mdx

The approved Bunny record in `private-test-catalogue.ts` is a technical fixture. It is intentionally omitted from every public catalogue collection, homepage row, movie grid, and search result, and can be opened only through its direct route.
