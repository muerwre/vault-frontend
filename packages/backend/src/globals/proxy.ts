import { connect } from 'tls';

import { SocksClient } from 'socks';
import { Agent, ProxyAgent, type Dispatcher } from 'undici';

/**
 * Outbound proxies for services unreachable from some networks (Telegram,
 * YouTube). Each service has its own `*_PROXY_URL` setting; parsing is kept
 * apart from connecting so it can be checked without opening a socket.
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
 * traffic direct.
 */
export const parseProxyUrl = (
  value: string,
  setting = 'proxy url',
): ParsedProxy | null => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`${setting} is not a valid url: ${trimmed}`);
  }

  const isSocks = SOCKS_SCHEMES.has(url.protocol);

  if (!isSocks && !HTTP_SCHEMES.has(url.protocol)) {
    throw new Error(
      `${setting} has unsupported scheme "${url.protocol}" — use http(s), socks4 or socks5`,
    );
  }

  if (!url.hostname) {
    throw new Error(`${setting} has no host: ${trimmed}`);
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

/**
 * Dispatcher that tunnels through a SOCKS proxy. undici has no
 * SOCKS support of its own, so the TCP connection is established by the SOCKS
 * client and handed back for undici to run TLS over.
 */
export const socksDispatcher = (proxy: ParsedProxy): Dispatcher =>
  new Agent({
    connect: async ({ hostname, port, protocol }, callback) => {
      try {
        const { socket } = await SocksClient.createConnection({
          proxy: {
            host: proxy.host,
            port: proxy.port,
            type: proxy.socksType ?? 5,
            userId: proxy.username,
            password: proxy.password,
          },
          command: 'connect',
          destination: {
            host: hostname,
            port: Number(port) || (protocol === 'https:' ? 443 : 80),
          },
        });

        if (protocol !== 'https:') {
          callback(null, socket);
          return;
        }

        // TLS must terminate at the destination, not at the proxy.
        const secure = connect({ socket, servername: hostname });

        secure.on('error', (error) => callback(error, null));
        secure.on('secureConnect', () => callback(null, secure));
      } catch (error) {
        callback(
          error instanceof Error ? error : new Error(String(error)),
          null,
        );
      }
    },
  });

/**
 * A dispatcher routing through `proxy`. HTTP proxies take their
 * proxy-authorization from the url's credentials.
 */
export const proxyDispatcher = (proxy: ParsedProxy): Dispatcher =>
  proxy.kind === 'socks'
    ? socksDispatcher(proxy)
    : new ProxyAgent({ uri: proxy.url });
