# KokoMax

KokoMax — Nga Udhekryqi Media is a film catalogue with a Phase 1 Supabase administration system. The safe player architecture supports exactly two source types: rights-approved Internet Archive identifiers and validated Bunny Stream library/video identifiers. Public routes read only approved, published database records; administrative routes require Supabase Auth plus membership in `admin_users`.

The planned canonical domain and metadata base are `https://kokomax.al`, with `www.kokomax.al` reserved as an optional hostname. DNS configuration and deployment remain intentionally deferred.

## Local development

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

The site fails closed when Supabase is not configured or unavailable: public catalogue queries return no records and private or draft records remain unavailable. The Bunny technical fixture is visible only through authenticated administrator preview after setup.

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
See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the exact one-time dashboard, migration, administrator and Storage setup.
