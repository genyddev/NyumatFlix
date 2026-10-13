# Udhekryqi Filma

Udhekryqi Filma is the current visual demonstration catalogue. Its fictional public catalogue entries remain unplayable. The safe player architecture supports exactly two source types: rights-approved Internet Archive identifiers and validated Bunny Stream library/video identifiers. It does not connect to authentication, email, or database services.

The future public domain is `kokomax.al`, with `www.kokomax.al` reserved as an optional hostname. The visual KokoMax rebrand, public metadata, DNS configuration, and deployment are intentionally deferred to a separate task.

## Local development

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

## Checks

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Attribution

This project is based on the MIT-licensed NyumaFlix source. The original MIT `LICENSE` and copyright notice are preserved unchanged in this repository. The current demonstration catalogue and titles are fictional; no title is represented as being in the public domain.

See [MIGRATION.md](MIGRATION.md) for the phase-one removal inventory and safety boundary.
See [PLAYER_SECURITY.md](PLAYER_SECURITY.md) for the provider allowlist, rights gate, validation rules, CSP, and upload boundary.
See [DEPLOYMENT.md](DEPLOYMENT.md) for the planned domain and Bunny Stream allowed-domain configuration.
