import { renderPopupError, renderPopupSuccess } from './oauth.popup';

/** Pulls the posted message back out of the rendered page. */
const postedMessage = (html: string): unknown => {
  const match = html.match(/postMessage\(\s*([\s\S]*?),\s*'\*'/);

  if (!match) {
    throw new Error(`no postMessage found in:\n${html}`);
  }

  // The argument is a JS object literal with JSON-safe values.
  return JSON.parse(
    match[1].replace(/(\w+):/g, '"$1":').replace(/,\s*}/g, '}'),
  );
};

describe('oauth popup', () => {
  it('posts the token under the processed event', () => {
    expect(postedMessage(renderPopupSuccess('abc.def.ghi'))).toEqual({
      type: 'oauth_processed',
      payload: { token: 'abc.def.ghi' },
    });
  });

  it('posts the message under the error event', () => {
    expect(postedMessage(renderPopupError('всё сломалось'))).toEqual({
      type: 'oauth_error',
      payload: { error: 'всё сломалось' },
    });
  });

  it('closes the window and only posts when opened as a popup', () => {
    const html = renderPopupSuccess('t');

    expect(html).toContain('if (window.opener)');
    expect(html).toContain('window.close()');
  });

  /** A value must never be able to break out of the script element. */
  it('escapes a value that tries to close the script', () => {
    const html = renderPopupError('</script><img src=x onerror=alert(1)>');

    expect(html).not.toContain('</script><img');
    expect(html).toContain('\\u003c/script');
    // Exactly one real script element remains.
    expect(html.match(/<\/script>/g)).toHaveLength(1);
  });

  it('escapes quotes and newlines rather than producing invalid js', () => {
    const html = renderPopupError('it\'s "broken"\nbadly');

    expect(html).toContain('\\n');
    expect(postedMessage(html)).toEqual({
      type: 'oauth_error',
      payload: { error: 'it\'s "broken"\nbadly' },
    });
  });
});
