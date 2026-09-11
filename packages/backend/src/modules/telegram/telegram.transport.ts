import { Injectable, Logger } from '@nestjs/common';
import { SocksClient } from 'socks';
// undici's own fetch, not the global one: the global is backed by Node's
// bundled copy, whose Dispatcher type is not interchangeable with this one.
import { Agent, fetch, ProxyAgent, type Dispatcher } from 'undici';

import { getTelegramConfig } from '../../config/env';

import {
  describeProxy,
  parseProxyUrl,
  type ParsedProxy,
} from './telegram.proxy';

export const TELEGRAM_API_ROOT = 'https://api.telegram.org';

/** Builds `https://api.telegram.org/bot<token>/<method>`. */
export const telegramMethodUrl = (token: string, method: string): string =>
  `${TELEGRAM_API_ROOT}/bot${token}/${method}`;

/**
 * Dispatcher that tunnels to the Bot API through a SOCKS proxy. undici has no
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

        // TLS must terminate at Telegram, not at the proxy.
        const { connect } = await import('tls');
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
 * Talks to the Telegram Bot API, optionally through a proxy.
 *
 * Everything bot-related goes through here — sends and long-polling alike — so
 * a network that blocks `api.telegram.org` only needs the one setting.
 */
@Injectable()
export class TelegramTransport {
  private readonly logger = new Logger('Telegram');

  private dispatcher?: Dispatcher;

  private resolved = false;

  get isEnabled(): boolean {
    return Boolean(getTelegramConfig().token);
  }

  /**
   * Calls a Bot API method and returns its `result`.
   *
   * Throws on transport failure or an `ok: false` response, so callers decide
   * whether a failed delivery is worth retrying.
   */
  async call<T>(
    method: string,
    payload: Record<string, unknown> = {},
  ): Promise<T> {
    const { token } = getTelegramConfig();

    if (!token) {
      throw new Error('Telegram bot token is not configured');
    }

    const response = await fetch(telegramMethodUrl(token, method), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      dispatcher: this.getDispatcher(),
    });

    const body = (await response.json()) as {
      ok?: boolean;
      result?: T;
      description?: string;
    };

    if (!response.ok || !body?.ok) {
      throw new Error(
        `telegram ${method} failed: ${body?.description ?? response.status}`,
      );
    }

    return body.result as T;
  }

  /**
   * The proxy dispatcher, or undefined for a direct connection. Resolved once
   * and cached; a malformed proxy URL is reported and then ignored rather than
   * retried on every call.
   */
  private getDispatcher(): Dispatcher | undefined {
    if (this.resolved) {
      return this.dispatcher;
    }

    this.resolved = true;

    try {
      const proxy = parseProxyUrl(getTelegramConfig().proxyUrl);

      if (!proxy) {
        return undefined;
      }

      // ProxyAgent derives proxy-authorization from the url's credentials.
      this.dispatcher =
        proxy.kind === 'socks'
          ? socksDispatcher(proxy)
          : new ProxyAgent({ uri: proxy.url });

      this.logger.log(`bot api routed through ${describeProxy(proxy)}`);
    } catch (error) {
      this.logger.error(error instanceof Error ? error.message : String(error));
    }

    return this.dispatcher;
  }
}
