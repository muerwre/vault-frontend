import { ConfigModule } from '@nestjs/config';
import { config } from 'dotenv';

/**
 * Env files in precedence order: `.env.local` (gitignored, per-developer) wins
 * over `.env`; production reads a single `.env` beside the bundle.
 *
 * Paths resolve from the process cwd, which is the package directory — hence the
 * `../..` hop to the repo root.
 */
const ENV_FILE_PATH =
  process.env.NODE_ENV === 'production'
    ? ['./.env']
    : ['../../.env.local', '../../.env'];

/** Populates `process.env` eagerly, for modules that read config at import time. */
export const loadConfig = () => config({ path: ENV_FILE_PATH });

export const CONFIG = ConfigModule.forRoot({
  envFilePath: ENV_FILE_PATH,
  isGlobal: true,
});

export const isDevMode = process.env.NODE_ENV !== 'production';

/**
 * Connection URI, e.g. `mariadb://root:password@localhost:3306/adonis`.
 *
 * Keep the `mariadb://` scheme: it selects the driver type, which changes how
 * column defaults are read (see data-source.ts). Defaults to `ci/compose.yml`'s
 * container so a fresh checkout works without setup.
 */
export const getDatabaseUrl = (): string =>
  process.env.DATABASE_URL ?? 'mariadb://root:password@localhost:3306/adonis';

export const getJwtSecret = (): string => process.env.JWT_SECRET ?? '';

/**
 * Google API key for the YouTube Data API v3, used by `GET /meta/youtube` to
 * resolve titles missing from the `embed` cache. Optional: without it, cached
 * embeds are still served and only new videos fail to resolve.
 */
export const getGoogleApiKey = (): string => process.env.GOOGLE_API_KEY ?? '';
