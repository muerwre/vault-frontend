import { DataSource, type DataSourceOptions } from 'typeorm';

import { getDatabaseUrl, loadConfig } from '../config/env';
import { ENTITIES } from '../entities';

loadConfig();

/**
 * Connection options shared by the Nest module and the TypeORM CLI, so a
 * generated migration always describes the schema the app runs against.
 *
 * Migrations live in this package because `migration:generate` diffs entity
 * metadata against the database and needs both in one place.
 */
export const dataSourceOptions: DataSourceOptions = {
  /**
   * Must stay `mariadb`, not `mysql`. Only this driver type reads MariaDB's
   * `information_schema` correctly — mapping a nullable column's literal `NULL`
   * default back to "no default", and normalising `current_timestamp()`. Under
   * `mysql` every nullable column and timestamp shows permanent schema drift.
   * Both types load the same `mysql2` client.
   */
  type: 'mariadb',
  url: getDatabaseUrl(),
  entities: ENTITIES,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',

  /**
   * **Never enable.** The schema mixes charsets, int widths and timestamp types
   * that entity metadata cannot fully express, so this would ALTER live columns
   * and drop the FULLTEXT indexes search depends on. Use migrations.
   */
  synchronize: false,

  // Run deliberately via `yarn migration:run`, so a rolling deploy cannot race.
  migrationsRun: false,

  /**
   * Connection charset. utf8mb4 is right even though most tables are utf8mb3: it
   * is a superset, and matches the server default. Per-column charsets are
   * pinned on the entities.
   */
  charset: 'utf8mb4',

  timezone: 'Z',

  // Keep BIGINT as a string to avoid silent precision loss.
  supportBigNumbers: true,
  bigNumberStrings: true,

  extra: {
    connectionLimit: 10,
  },
};

/**
 * The DataSource the TypeORM CLI picks up (`-d src/database/data-source.ts`).
 *
 * Must remain the file's **only** exported `DataSource`; the CLI rejects a module
 * exporting more than one (a `default` re-export counts) with a silent exit 1.
 */
export const dataSource = new DataSource(dataSourceOptions);
