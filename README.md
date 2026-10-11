# Udhekryqi Filma

Udhekryqi Filma is a visual demonstration catalogue. Its fictional public catalogue entries remain unplayable. The safe player architecture supports only rights-approved Internet Archive identifiers and validated Mux playback IDs; it does not connect to authentication, email, or database services.

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
