import type { Request } from 'express';

import {
  popupTargetOrigin,
  renderPopupError,
  renderPopupSuccess,
} from './oauth.popup';

const ORIGIN = 'https://vault48.org';

/** Pulls the posted message back out of the rendered page. */
const postedMessage = (html: string): unknown => {
  const match = html.match(/postMessage\(\s*([\s\S]*?),\s*"/);

  if (!match) {
    throw new Error(`no postMessage found in:\n${html}`);
  }

  // The argument is a JS object literal with JSON-safe values.
  return JSON.parse(
    match[1].replace(/(\w+):/g, '"$1":').replace(/,\s*}/g, '}'),
  );
};

describe('oauth popup', () => {
  /**
   * A claim is redeemable for an API token, so the opener must be named. With
   * `*` any site could open this url and read the claim of whoever is signed in.
   */
  describe('target origin', () => {
    it('never broadcasts to every origin', () => {
      const html = renderPopupSuccess('abc', ORIGIN);

      expect(html).not.toContain("'*'");
      expect(html).toContain('"https://vault48.org"');
    });

    it('posts errors to a named origin too', () => {
      expect(renderPopupError('nope', ORIGIN)).not.toContain("'*'");
    });

    const asRequest = (host: string | undefined, protocol = 'https') =>
      ({ protocol, get: () => host }) as unknown as Request;

    it('targets the host the handshake was opened on', () => {
      expect(popupTargetOrigin(asRequest('unstable.vault48.org'))).toBe(
        'https://unstable.vault48.org',
      );
      expect(popupTargetOrigin(asRequest('vault48.org', 'http'))).toBe(
        'http://vault48.org',
      );
    });

    it('falls back to the public url when there is no host header', () => {
      process.env.PUBLIC_URL = 'https://fallback.example';

      expect(popupTargetOrigin(asRequest(undefined))).toBe(
        'https://fallback.example',
      );

      delete process.env.PUBLIC_URL;
    });
  });

  it('posts the token under the processed event', () => {
    expect(postedMessage(renderPopupSuccess('abc.def.ghi', ORIGIN))).toEqual({
      type: 'oauth_processed',
      payload: { token: 'abc.def.ghi' },
    });
  });

  it('posts the message under the error event', () => {
    expect(postedMessage(renderPopupError('всё сломалось', ORIGIN))).toEqual({
      type: 'oauth_error',
      payload: { error: 'всё сломалось' },
    });
  });

  it('closes the window and only posts when opened as a popup', () => {
    const html = renderPopupSuccess('t', ORIGIN);

    expect(html).toContain('if (window.opener)');
    expect(html).toContain('window.close()');
  });

  /** A value must never be able to break out of the script element. */
  it('escapes a value that tries to close the script', () => {
    const html = renderPopupError(
      '</script><img src=x onerror=alert(1)>',
      ORIGIN,
    );

    expect(html).not.toContain('</script><img');
    expect(html).toContain('\\u003c/script');
    // Exactly one real script element remains.
    expect(html.match(/<\/script>/g)).toHaveLength(1);
  });

  it('escapes quotes and newlines rather than producing invalid js', () => {
    const html = renderPopupError('it\'s "broken"\nbadly', ORIGIN);

    expect(html).toContain('\\n');
    expect(postedMessage(html)).toEqual({
      type: 'oauth_error',
      payload: { error: 'it\'s "broken"\nbadly' },
    });
  });
});
