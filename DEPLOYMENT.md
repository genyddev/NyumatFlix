# Planned domain and deployment boundary

No deployment, DNS change, or production subdomain connection has been performed in this phase. The KokoMax name, supplied logo, canonical metadata, and social-sharing metadata are configured locally only.

## Future public domain

- Primary hostname: `kokomax.al`
- Optional `www` hostname: `www.kokomax.al`
- Local development hostname: `localhost`

The previous planned hostname, `filma.udhekryqi.al`, is retired and must not be used for the streaming platform. A later deployment task will decide whether `www.kokomax.al` redirects to `kokomax.al` or serves the application directly, and will configure DNS and hosting.

Local development remains available through URLs such as `http://localhost:3000` and `http://localhost:3210`.

## Bunny Stream allowed domains

When Bunny Stream domain restrictions are enabled, configure these entries manually in **Stream → Library → Security → Allowed domains**:

```text
kokomax.al
www.kokomax.al
localhost
```

Bunny requires hostname entries without `https://`, paths, or port numbers. The `localhost` entry therefore covers the local development ports used by this project. The Bunny iframe uses `strict-origin-when-cross-origin`, allowing Bunny to receive only the embedding origin required for hostname validation rather than the full movie-page URL.

Do not add `filma.udhekryqi.al` to the future allowlist. Do not put a Bunny API key, access key, token-signing secret, or upload credential in this repository or browser code. The existing test Library ID and Video ID remain unchanged.

Official references:

- https://github.com/BunnyWay/documentation/blob/main/stream/embedding.mdx
- https://github.com/BunnyWay/documentation/blob/main/stream/security-options.mdx
