# @vault/migration

**Schema migrations do not live here — they live in `packages/backend/src/database/migrations`.**

## Why

`migration:generate` diffs entity metadata against the live schema, so the
generator needs the entities and the `DataSource` in the same place. Hosting
migrations in a separate package would mean importing the backend's compiled
entities from it, adding a build-order dependency between two halves of one
concern. The TypeORM CLI is wired up in the backend package instead:

```bash
yarn workspace @vault/backend run migration:generate src/database/migrations/Name
yarn workspace @vault/backend run migration:run
yarn workspace @vault/backend run migration:show
```

The naming is inherited from the orchid example (`examples/nestjs-with-react-monorepo`),
whose `packages/migration` is likewise **not** a schema-migration runner — it is a
one-off MariaDB↔Postgres data-porting tool.

## What this package is for

One-off **data** tooling: backfills, anonymised dev fixtures, and similar scripts
that operate on rows rather than schema. It is currently empty, because the
Go → NestJS migration keeps the *same* database and so needs no data porting.

The local database itself is defined in `ci/compose.yml` and seeded straight from
the production dump:

```bash
yarn db:up      # start MariaDB, seeded from examples/*.sql.xz on first boot
yarn db:reset   # wipe the volume and re-seed
yarn db:cli     # mariadb shell
```

If nothing lands here, this package can simply be deleted.
