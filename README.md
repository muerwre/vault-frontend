# Vault

Monorepo for Vault (vault48.org). Yarn workspaces + Lerna task runner.

## Packages

| Package | Name | Role |
|---|---|---|
| `packages/frontend` | `@vault/frontend` | Next.js app (moved unchanged from the old repo root) |
| `packages/backend` | `@vault/backend` | NestJS API — rewrite of the Go backend (`examples/vault-golang`) |
| `packages/common` | `@vault/common` | Shared TS: enums, wire DTOs, validation (the client/server contract) |
| `packages/migration` | `@vault/migration` | TypeORM migrations matching the live MySQL schema |
| `packages/e2e` | `@vault/e2e` | Playwright end-to-end tests |

## Architecture

The frontend stays a **Next.js SSR** app (`output: 'standalone'`) and runs as its **own process**;
NestJS serves only `/api`. A reverse proxy routes `/api` → NestJS and everything else → Next.js.
See `examples/migration-spec/` for the full backend spec, data model, and migration plan.

## Common commands

```bash
yarn install            # install all workspaces
yarn dev                # run all packages' dev scripts in parallel
yarn frontend:dev       # Next.js dev server only
yarn backend:dev        # NestJS dev server only (API under /api)
yarn build              # build every package (common first)
yarn typecheck          # typecheck all packages
```

> `examples/` (the Go backend, the reference monorepo, the DB dump, and the migration spec) is
> git-ignored reference material, not part of the shipped build.
