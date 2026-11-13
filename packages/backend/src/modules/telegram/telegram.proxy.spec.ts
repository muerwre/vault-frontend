import { describeProxy, parseProxyUrl } from './telegram.proxy';

describe('telegram proxy url', () => {
  describe('parseProxyUrl', () => {
    /** No proxy configured means a direct connection, not an error. */
    it('returns null for an empty or blank value', () => {
      expect(parseProxyUrl('')).toBeNull();
      expect(parseProxyUrl('   ')).toBeNull();
    });

    it('parses an http proxy', () => {
      expect(parseProxyUrl('http://proxy.local:3128')).toEqual({
        kind: 'http',
        url: 'http://proxy.local:3128',
        host: 'proxy.local',
        port: 3128,
      });
    });

    it('parses a socks5 proxy', () => {
      expect(parseProxyUrl('socks5://127.0.0.1:9050')).toMatchObject({
        kind: 'socks',
        host: '127.0.0.1',
        port: 9050,
        socksType: 5,
      });
    });

    /** `socks5h` differs only in who resolves DNS; the tunnel is the same. */
    it('treats socks and socks5h as socks5', () => {
      expect(parseProxyUrl('socks://h:1080')).toMatchObject({ socksType: 5 });
      expect(parseProxyUrl('socks5h://h:1080')).toMatchObject({ socksType: 5 });
    });

    it('parses socks4 as version 4', () => {
      expect(parseProxyUrl('socks4://h:1080')).toMatchObject({ socksType: 4 });
    });

    it('applies the default port per scheme', () => {
      expect(parseProxyUrl('http://h')?.port).toBe(80);
      expect(parseProxyUrl('https://h')?.port).toBe(443);
      expect(parseProxyUrl('socks5://h')?.port).toBe(1080);
    });

    it('reads credentials and decodes them', () => {
      expect(parseProxyUrl('socks5://user:p%40ss@h:1080')).toMatchObject({
        username: 'user',
        password: 'p@ss',
      });
    });

    it('omits credentials that are not there', () => {
      expect(parseProxyUrl('http://h:3128')).not.toHaveProperty('username');
    });

    /** A typo must surface rather than silently sending bot traffic direct. */
    it('throws on a malformed url', () => {
      expect(() => parseProxyUrl('not a url')).toThrow(/not a valid url/);
    });

    it('throws on an unsupported scheme', () => {
      expect(() => parseProxyUrl('ftp://h:21')).toThrow(/unsupported scheme/);
      expect(() => parseProxyUrl('mtproto://h:443')).toThrow(
        /unsupported scheme/,
      );
    });
  });

  describe('describeProxy', () => {
    /** Safe to log: credentials must never appear. */
    it('reports host and port without credentials', () => {
      const proxy = parseProxyUrl('socks5://user:secret@proxy.local:1080');

      expect(describeProxy(proxy!)).toBe('socks://proxy.local:1080');
      expect(describeProxy(proxy!)).not.toContain('secret');
      expect(describeProxy(proxy!)).not.toContain('user');
    });
  });
});
