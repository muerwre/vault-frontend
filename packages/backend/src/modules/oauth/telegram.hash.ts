import { createHash, createHmac, timingSafeEqual } from 'crypto';

/** What the Telegram login widget posts. */
export interface TelegramAuthPayload {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date?: number | string;
  hash?: string;
}

/** Fields covered by the signature, in the order Telegram documents. */
const SIGNED_FIELDS = [
  'auth_date',
  'first_name',
  'id',
  'last_name',
  'photo_url',
  'username',
] as const;

/**
 * The data-check string: `key=value` lines for the fields that are present,
 * sorted by key and joined by newlines. Absent or empty fields are omitted,
 * which is what the widget signs.
 */
export const buildCheckString = (payload: TelegramAuthPayload): string =>
  SIGNED_FIELDS.map((key) => [key, payload[key]] as const)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    )
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('\n');

/**
 * Verifies the widget signature: HMAC-SHA256 of the check string, keyed by
 * SHA256 of the bot token.
 *
 * Returns false when no token is configured, so an unconfigured deployment
 * cannot be talked into accepting arbitrary Telegram identities.
 */
export const isTelegramHashValid = (
  payload: TelegramAuthPayload,
  botToken: string,
): boolean => {
  if (!botToken || !payload?.hash) {
    return false;
  }

  const expected = createHmac(
    'sha256',
    createHash('sha256').update(botToken).digest(),
  )
    .update(buildCheckString(payload))
    .digest('hex');

  const provided = Buffer.from(String(payload.hash), 'utf8');
  const computed = Buffer.from(expected, 'utf8');

  return (
    provided.length === computed.length && timingSafeEqual(provided, computed)
  );
};

/**
 * Display name for the linked account: the real name when given, with the
 * handle appended in brackets. Falls back to the bare handle.
 */
export const telegramAccountName = (payload: TelegramAuthPayload): string => {
  const full = [payload.first_name, payload.last_name]
    .filter((part): part is string => Boolean(part))
    .join(' ');

  if (!full) {
    return payload.username ?? '';
  }

  return payload.username ? `${full} (${payload.username})` : full;
};
