import { Injectable, Logger } from '@nestjs/common';
// undici's own fetch, not the global one: the global is backed by Node's
// bundled copy, whose Dispatcher type is not interchangeable with this one.
import { fetch, type Dispatcher } from 'undici';

import { getTelegramConfig } from '../../config/env';
import {
  describeProxy,
  parseProxyUrl,
  proxyDispatcher,
} from '../../globals/proxy';

export const TELEGRAM_API_ROOT = 'https://api.telegram.org';

/** Builds `https://api.telegram.org/bot<token>/<method>`. */
export const telegramMethodUrl = (token: string, method: string): string =>
  `${TELEGRAM_API_ROOT}/bot${token}/${method}`;

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
   * whether a failed delivery is worth retrying. `signal` aborts a pending call,
   * which a long-poll needs to release shutdown promptly.
   */
  async call<T>(
    method: string,
    payload: Record<string, unknown> = {},
    signal?: AbortSignal,
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
      signal,
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
      const proxy = parseProxyUrl(
        getTelegramConfig().proxyUrl,
        'TELEGRAM_PROXY_URL',
      );

      if (!proxy) {
        return undefined;
      }

      this.dispatcher = proxyDispatcher(proxy);

      this.logger.log(`bot api routed through ${describeProxy(proxy)}`);
    } catch (error) {
      this.logger.error(error instanceof Error ? error.message : String(error));
    }

    return this.dispatcher;
  }
}
