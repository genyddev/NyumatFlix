# Safe movie player architecture

The runtime recognizes exactly two source discriminators:

- `internet_archive` with a validated Internet Archive identifier.
- `bunny_stream` with a validated numeric Bunny library ID and UUID video ID.

`SafeMoviePlayer` refuses playback unless the movie has `rightsStatus: "approved"`. `unverified`, `rejected`, missing, and malformed sources render the Albanian safe placeholder. All fictional public demonstration records are unverified and have no source.

## Internet Archive

The application accepts an identifier containing only ASCII letters, numbers, period, underscore, and hyphen, with a maximum length of 100 characters. It constructs `https://archive.org/embed/{identifier}` internally and never accepts an Archive URL, file URL, iframe fragment, query string, or HTML. The resulting iframe is sandboxed and the parent CSP permits frames only from `https://archive.org`.

An Archive item must be manually verified as public domain and marked approved before its identifier is added. Presence on Internet Archive alone is not treated as proof of public-domain status.

## Explicitly excluded

- No third video provider, provider fallback, or automatic provider discovery.
- No Bunny upload or management API, API key, access key, signing secret, or token-generation code.
- No R2 movie storage.
- No YouTube player or origin.
- No arbitrary media URL, iframe HTML, provider fallback, provider discovery, proxy, or scraper.

## Bunny Stream

The application accepts only a numeric library ID and a UUID-shaped video ID. `BunnyStreamPlayer` constructs the official embed URL internally on the exact `https://player.mediadelivery.net` origin. It explicitly sets `autoplay=false` and `muted=false`, does not grant the iframe autoplay permission, and never accepts iframe HTML or a caller-supplied URL.

The parent CSP adds only `https://player.mediadelivery.net` to `frame-src`; it does not add a Bunny wildcard, API origin, storage hostname, or direct media origin. Playback through Bunny's hosted iframe needs no API key. No Bunny API key, upload credential, or management endpoint exists in browser or server code.

The future Bunny Stream allowed-domain list is `kokomax.al`, `www.kokomax.al`, and `localhost`. Bunny matches the iframe request's referrer hostname, so these dashboard entries are written without schemes, paths, or ports. The iframe's `strict-origin-when-cross-origin` policy preserves hostname validation while withholding the movie-page path. `localhost` keeps development playback working; neither production hostname is required for local testing. See `DEPLOYMENT.md` for the manual dashboard checklist. No Bunny security setting is changed through an API.

Official reference:

- https://github.com/BunnyWay/documentation/blob/main/stream/embedding.mdx
- https://github.com/BunnyWay/documentation/blob/main/stream/security-options.mdx

The approved Bunny record is seeded in Supabase as a private draft and is also retained in `private-test-catalogue.ts` as a test-only fixture. It is intentionally omitted from every public catalogue query, homepage row, movie grid, search result, and public detail route. Playback is available only through the authenticated administrator preview.
