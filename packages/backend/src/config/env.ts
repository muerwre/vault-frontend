import { ConfigModule } from '@nestjs/config';
import { config } from 'dotenv';

/**
 * Env files, in precedence order. Mirrors the orchid example: `.env.local` (not
 * committed, per-developer) overrides the committed `.env`, and production reads
 * a single `.env` next to the bundle.
 *
 * Paths are relative to the process cwd, which for `nest start` is the package
 * directory (`packages/backend`) — hence the `../..` hop to the repo root.
 */
const ENV_FILE_PATH =
  process.env.NODE_ENV === 'production'
    ? ['./.env']
    : ['../../.env.local', '../../.env'];

/**
 * Populates `process.env` eagerly. Needed by modules that read config at import
 * time (the DataSource and the JWT module) rather than through DI.
 */
export const loadConfig = () => config({ path: ENV_FILE_PATH });

export const CONFIG = ConfigModule.forRoot({
  envFilePath: ENV_FILE_PATH,
  isGlobal: true,
});

export const isDevMode = process.env.NODE_ENV !== 'production';

/**
 * The connection URI, e.g.
 * `mariadb://root:password@localhost:3306/vault`.
 *
 * Keep the `mariadb://` scheme — the driver type it selects changes how TypeORM
 * reads column defaults out of `information_schema` (see data-source.ts).
 *
 * Defaults to the local container from `ci/compose.yml` so a fresh checkout can
 * run `migration:show` without any setup.
 */
export const getDatabaseUrl = (): string =>
  process.env.DATABASE_URL ?? 'mariadb://root:password@localhost:3306/vault';

export const getJwtSecret = (): string => process.env.JWT_SECRET ?? '';
