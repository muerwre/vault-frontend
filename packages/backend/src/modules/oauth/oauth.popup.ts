import { OAUTH_POPUP_EVENTS } from '@vault/common/constants';
import type { Request } from 'express';

import { getPublicUrl } from '../../config/env';

/**
 * The popup handshake. `/process` runs inside a window the frontend opened, so
 * it answers with HTML that posts the result to `window.opener` and closes.
 *
 * The event names and the `{ type, payload }` shape are a hard frontend
 * dependency — see `useOauthEventListeners`.
 */

/**
 * Where the claim may be posted.
 *
 * It must never be `*`: the window that opened the popup is whatever page
 * started the handshake, so a broadcast hands a signed claim — redeemable for
 * an API token — to any site that opened this url. The popup runs on the host
 * the user is on, so that host is the opener, and the browser refuses delivery
 * to any other origin.
 *
 * A host is only trusted when it carries this site's certificate, so the
 * `Host` header cannot be pointed somewhere else; `PUBLIC_URL` covers a
 * request that arrives without one.
 */
export const popupTargetOrigin = (request: Request): string => {
  const host = request.get('host');

  return host ? `${request.protocol}://${host}` : getPublicUrl();
};

/**
 * Embeds a value in a `<script>` safely.
 *
 * `JSON.stringify` handles quoting and escaping; `<` must additionally be
 * escaped so a value can never close the script element early.
 */
const embed = (value: string): string =>
  JSON.stringify(value).replace(/</g, '\\u003c');

const page = (
  type: string,
  payloadKey: string,
  value: string,
  targetOrigin: string,
): string => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>vault</title>
    <script>
      if (window.opener) {
        window.opener.postMessage(
          { type: ${embed(type)}, payload: { ${payloadKey}: ${embed(value)} } },
          ${embed(targetOrigin)},
        );
      }

      window.close();
    </script>
  </head>
  <body></body>
</html>
`;

export const renderPopupSuccess = (
  token: string,
  targetOrigin: string,
): string => page(OAUTH_POPUP_EVENTS.PROCESSED, 'token', token, targetOrigin);

export const renderPopupError = (
  message: string,
  targetOrigin: string,
): string => page(OAUTH_POPUP_EVENTS.ERROR, 'error', message, targetOrigin);
