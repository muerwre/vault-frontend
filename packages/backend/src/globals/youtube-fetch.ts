import { Logger } from '@nestjs/common';
import { fetch as undiciFetch, type Dispatcher } from 'undici';

import { getYoutubeProxyUrl } from '../config/env';

import { describeProxy, parseProxyUrl, proxyDispatcher } from './proxy';

const logger = new Logger('Youtube');

let resolvedFor: string | undefined;
let dispatcher: Dispatcher | undefined;

/**
 * The proxy dispatcher for the current `YOUTUBE_PROXY_URL`, or undefined for a
 * direct connection. Rebuilt only when the setting changes; a malformed url is
 * reported once and then ignored.
 */
const getDispatcher = (): Dispatcher | undefined => {
  const url = getYoutubeProxyUrl();

  if (url === resolvedFor) {
    return dispatcher;
  }

  resolvedFor = url;
  dispatcher = undefined;

  try {
    const proxy = parseProxyUrl(url, 'YOUTUBE_PROXY_URL');

    if (proxy) {
      dispatcher = proxyDispatcher(proxy);
      logger.log(`youtube routed through ${describeProxy(proxy)}`);
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
  }

  return dispatcher;
};

/**
 * `fetch` for YouTube hosts, through `YOUTUBE_PROXY_URL` when one is set.
 *
 * Without a proxy this is the global fetch. With one it is undici's own,
 * because only that accepts a dispatcher of this undici's type.
 */
export const youtubeFetch = async (
  url: string | URL,
  init: { method?: string; signal?: AbortSignal } = {},
): Promise<Response> => {
  const proxied = getDispatcher();

  if (!proxied) {
    return fetch(url, init);
  }

  return (await undiciFetch(url, {
    ...init,
    dispatcher: proxied,
  })) as unknown as Response;
};
