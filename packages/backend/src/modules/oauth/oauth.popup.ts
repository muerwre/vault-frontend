import { OAUTH_POPUP_EVENTS } from '@vault/common/constants';

/**
 * The popup handshake. `/process` runs inside a window the frontend opened, so
 * it answers with HTML that posts the result to `window.opener` and closes.
 *
 * The event names and the `{ type, payload }` shape are a hard frontend
 * dependency — see `useOauthEventListeners`.
 */

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
): string => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>vault</title>
    <script>
      if (window.opener) {
        window.opener.postMessage(
          { type: ${embed(type)}, payload: { ${payloadKey}: ${embed(value)} } },
          '*',
        );
      }

      window.close();
    </script>
  </head>
  <body></body>
</html>
`;

export const renderPopupSuccess = (token: string): string =>
  page(OAUTH_POPUP_EVENTS.PROCESSED, 'token', token);

export const renderPopupError = (message: string): string =>
  page(OAUTH_POPUP_EVENTS.ERROR, 'error', message);
