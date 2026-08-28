import { DataSource, type DataSourceOptions } from 'typeorm';

import { getDatabaseUrl, loadConfig } from '../config/env';
import { ENTITIES } from '../entities';

loadConfig();

/**
 * Connection options shared by the Nest module and the TypeORM CLI, so a
 * migration generated from the CLI is guaranteed to describe the same schema the
 * app runs against.
 *
 * ## Why migrations live in the backend package
 *
 * `migration:generate` diffs the entity metadata against the live schema, so the
 * generator needs the entities and the DataSource in one place. Keeping
 * migrations in a separate package would mean importing the backend's compiled
 * entities from it — a build-order dependency for what is really the same
 * concern. `packages/migration` instead owns the *data* tooling (mirroring the
 * orchid example, whose `migration` package is a Maria↔Postgres porting tool,
 * not a schema-migration runner).
 */
export const dataSourceOptions: DataSourceOptions = {
  /**
   * `mariadb`, not `mysql` — production runs MariaDB 10.8 and the distinction is
   * load-bearing for schema comparison, not cosmetic. TypeORM only applies two
   * MariaDB-specific readings of `information_schema` under this type:
   *
   * - MariaDB ≥10.2.7 reports a nullable column's default as the literal string
   *   `NULL`; only the mariadb branch maps that back to "no default". Under
   *   `mysql` every one of the ~60 nullable columns reads as
   *   `DEFAULT 'NULL'` and shows up as permanent drift.
   * - MariaDB reports `current_timestamp()` **with parentheses**; only the
   *   mariadb branch normalises the entity side to match.
   *
   * Both drivers load the same `mysql2` client, so this costs nothing.
   */
  type: 'mariadb',
  url: getDatabaseUrl(),
  entities: ENTITIES,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',

  /**
   * **Never enable.** The live schema predates these entities and mixes charsets,
   * int widths and timestamp types; `synchronize` would happily ALTER production
   * columns (and drop the FULLTEXT indexes search depends on). Schema changes go
   * through explicit, reviewed migrations only.
   */
  synchronize: false,

  /**
   * Migrations are run deliberately (`yarn migration:run`), not on boot, so a
   * rolling deploy can't have two instances racing to apply the same migration.
   */
  migrationsRun: false,

  /**
   * The connection charset. utf8mb4 is correct for the *connection* even though
   * most tables are utf8mb3: it is a superset, so reads and writes of existing
   * data are unaffected, and it matches the server default the newer tables were
   * created under. Per-column charsets are pinned on the entities themselves.
   */
  charset: 'utf8mb4',

  timezone: 'Z',

  /**
   * Return `DATETIME`/`TIMESTAMP` as JS Date objects rather than strings, and
   * keep `BIGINT` as a string (none in this schema, but it avoids silent
   * precision loss if one is added).
   */
  supportBigNumbers: true,
  bigNumberStrings: true,

  extra: {
    connectionLimit: 10,
  },
};

/**
 * The DataSource the TypeORM CLI picks up (`-d src/database/data-source.ts`).
 *
 * Must be the file's **only** exported `DataSource` — the CLI rejects a module
 * that exports more than one (a re-export as `default` counts as a second), and
 * it reports that failure as a silent exit code 1.
 */
export const dataSource = new DataSource(dataSourceOptions);
