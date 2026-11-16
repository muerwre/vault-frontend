# Vault

Monorepo for Vault (vault48.org). Yarn workspaces + Lerna task runner.

## Packages

| Package | Name | Role |
|---|---|---|
| `packages/frontend` | `@vault/frontend` | Next.js app (moved unchanged from the old repo root) |
| `packages/backend` | `@vault/backend` | NestJS API — rewrite of the old Go backend, wire- and storage-compatible with it |
| `packages/common` | `@vault/common` | Shared TS: enums, wire DTOs, validation (the client/server contract) |
| `packages/migration` | `@vault/migration` | Reserved for one-off data tooling; currently empty. Schema migrations live in `packages/backend/src/database/migrations` |
| `packages/e2e` | `@vault/e2e` | Playwright end-to-end tests |

## Architecture

The frontend stays a **Next.js SSR** app (`output: 'standalone'`) and runs as its **own process**;
NestJS serves only `/api`. A reverse proxy routes `/api` → NestJS and everything else → Next.js.

## Common commands

```bash
yarn install            # install all workspaces
yarn dev                # run all packages' dev scripts in parallel
yarn frontend:dev       # Next.js dev server only
yarn backend:dev        # NestJS dev server only (API under /api)
yarn build              # build every package (common first)
yarn typecheck          # typecheck all packages
```

## Local database

`yarn db:up` starts MariaDB from `ci/dev.compose.yml`, seeded on first boot from a production dump.
The dump is not in the repository: place it at `examples/2026-07-15-vault-stable__db.sql.xz`
(git-ignored) before the first start, or point the volume in `ci/dev.compose.yml` at your own.
