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

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

/** Mail is optional: an empty host disables sending. */
export const getSmtpConfig = (): SmtpConfig => ({
  host: process.env.SMTP_HOST ?? '',
  port: Number.parseInt(process.env.SMTP_PORT ?? '25', 10) || 25,
  user: process.env.SMTP_USER ?? '',
  password: process.env.SMTP_PASSWORD ?? '',
  from: process.env.SMTP_FROM ?? '',
});

/** Host used to build absolute links in outgoing mail. */
export const getPublicHost = (): string =>
  process.env.FRONTEND_PUBLIC_HOST ?? '';

/** Path the password-reset link points at; the code is appended to it. */
export const getFrontendResetUrl = (): string =>
  process.env.FRONTEND_RESET_URL ?? '/restore/';

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

/**
 * A provider is enabled only when all three values are present; the OAuth
 * routes 404 for a provider that is not configured.
 */
export const isOAuthProviderConfigured = (
  config: OAuthProviderConfig,
): boolean =>
  Boolean(config.clientId && config.clientSecret && config.callbackUrl);

export const getVkOAuthConfig = (): OAuthProviderConfig => ({
  clientId: process.env.VK_CLIENT_ID ?? '',
  clientSecret: process.env.VK_CLIENT_SECRET ?? '',
  callbackUrl: process.env.VK_CALLBACK_URL ?? '',
});

export const getGoogleOAuthConfig = (): OAuthProviderConfig => ({
  clientId: process.env.GOOGLE_CLIENT_ID ?? '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? '',
});

/** Bot token for the Telegram login widget. Empty disables Telegram linking. */
export const getTelegramToken = (): string => process.env.TELEGRAM_TOKEN ?? '';

export interface TelegramConfig {
  token: string;
  /**
   * Outbound proxy for `api.telegram.org`, which is blocked in some networks.
   * `http(s)://`, `socks5://`, `socks5h://` and `socks4://` are understood;
   * empty means connect directly.
   */
  proxyUrl: string;
  /** Minutes between delivery runs. */
  cooldownMins: number;
  /** Unsent notifications older than this are dropped rather than delivered. */
  purgeAfterDays: number;
  /** Cap on messages sent to one recipient per run. */
  maxMessages: number;
}

const toPositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getTelegramConfig = (): TelegramConfig => ({
  token: getTelegramToken(),
  proxyUrl: process.env.TELEGRAM_PROXY_URL ?? '',
  cooldownMins: toPositiveInt(process.env.TELEGRAM_COOLDOWN_MINS, 5),
  purgeAfterDays: toPositiveInt(process.env.TELEGRAM_PURGE_AFTER_DAYS, 3),
  maxMessages: toPositiveInt(process.env.TELEGRAM_MAX_MESSAGES, 3),
});

/**
 * Signs the OAuth handshake session. PKCE requires the code verifier to outlive
 * the redirect to the provider, so it is kept in a session cookie scoped to the
 * OAuth routes. Falls back to the JWT secret when unset.
 */
export const getSessionSecret = (): string =>
  process.env.SESSION_SECRET || getJwtSecret();

export interface UploadsConfig {
  path: string;
  maxSizeMb: number;
  outputWebp: boolean;
}

/**
 * Where uploaded files live on disk. Stored `file.path` values are relative to
 * this, so changing it breaks every historical URL.
 */
export const getUploadsConfig = (): UploadsConfig => ({
  path: process.env.UPLOADS_PATH ?? '',
  maxSizeMb:
    Number.parseInt(process.env.UPLOADS_MAX_SIZE_MB ?? '200', 10) || 200,
  outputWebp: process.env.UPLOADS_OUTPUT_WEBP === 'true',
});
