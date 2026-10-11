# Safe movie player architecture

The runtime recognizes exactly two source discriminators:

- `internet_archive` with a validated Internet Archive identifier.
- `mux` with a validated Mux playback ID.

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
- No R2 movie storage.
- No YouTube player or origin.
- No arbitrary media URL, iframe HTML, provider fallback, provider discovery, proxy, or scraper.

Initial Mux uploads are performed manually in the Mux dashboard. A playback ID can be added to the catalogue only after written streaming permission has been recorded and the movie is marked approved.
