/**
 * Outbound proxy for the Telegram Bot API.
 *
 * `api.telegram.org` is unreachable from some networks, so every call — both
 * sends and long-polling — can be routed through a proxy. Parsing lives apart
 * from the transport so it can be checked without opening a connection.
 */

export type ProxyKind = 'http' | 'socks';

export interface ParsedProxy {
  kind: ProxyKind;
  url: string;
  host: string;
  port: number;
  /** SOCKS version, only meaningful when `kind` is `socks`. */
  socksType?: 4 | 5;
  username?: string;
  password?: string;
}

/** Default ports by scheme, used when the URL omits one. */
const DEFAULT_PORTS: Record<string, number> = {
  'http:': 80,
  'https:': 443,
  'socks:': 1080,
  'socks4:': 1080,
  'socks5:': 1080,
  'socks5h:': 1080,
};

const SOCKS_SCHEMES = new Set(['socks:', 'socks4:', 'socks5:', 'socks5h:']);
const HTTP_SCHEMES = new Set(['http:', 'https:']);

/**
 * Returns null when no proxy is configured, and throws when one is configured
 * but unusable — a typo must surface at startup rather than silently sending
 * bot traffic direct.
 */
export const parseProxyUrl = (value: string): ParsedProxy | null => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`TELEGRAM_PROXY_URL is not a valid url: ${trimmed}`);
  }

  const isSocks = SOCKS_SCHEMES.has(url.protocol);

  if (!isSocks && !HTTP_SCHEMES.has(url.protocol)) {
    throw new Error(
      `TELEGRAM_PROXY_URL has unsupported scheme "${url.protocol}" — use http(s), socks4 or socks5`,
    );
  }

  if (!url.hostname) {
    throw new Error(`TELEGRAM_PROXY_URL has no host: ${trimmed}`);
  }

  const port = url.port
    ? Number.parseInt(url.port, 10)
    : DEFAULT_PORTS[url.protocol];

  return {
    kind: isSocks ? 'socks' : 'http',
    url: trimmed,
    host: url.hostname,
    port,
    ...(isSocks
      ? { socksType: url.protocol === 'socks4:' ? (4 as const) : (5 as const) }
      : {}),
    ...(url.username ? { username: decodeURIComponent(url.username) } : {}),
    ...(url.password ? { password: decodeURIComponent(url.password) } : {}),
  };
};

/** Hides credentials, so a proxy URL can be logged safely. */
export const describeProxy = (proxy: ParsedProxy): string =>
  `${proxy.kind}://${proxy.host}:${proxy.port}`;
