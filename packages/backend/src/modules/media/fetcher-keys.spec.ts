import {
  bearerSecret,
  matchFetcherKey,
  parseFetcherKeys,
} from './fetcher-keys';

describe('fetcher keys', () => {
  describe('parseFetcherKeys', () => {
    it('reads name:secret pairs, keeping colons inside secrets', () => {
      expect(parseFetcherKeys(' home:abc , vps:x:y:z ')).toEqual([
        { name: 'home', secret: 'abc' },
        { name: 'vps', secret: 'x:y:z' },
      ]);
    });

    it.each(['', 'nosecret', ':secret', 'name:', ' , '])(
      'drops incomplete entries in %p',
      (value) => {
        expect(parseFetcherKeys(value)).toEqual([]);
      },
    );
  });

  describe('matchFetcherKey', () => {
    const keys = parseFetcherKeys('home:first-secret,vps:second-secret');

    it('names the fetcher a secret belongs to', () => {
      expect(matchFetcherKey(keys, 'second-secret')).toBe('vps');
    });

    it.each(['', 'first', 'first-secret ', 'nope'])('refuses %p', (secret) => {
      expect(matchFetcherKey(keys, secret)).toBeNull();
    });

    it('refuses everything when no keys are configured', () => {
      expect(matchFetcherKey([], 'anything')).toBeNull();
    });
  });

  describe('bearerSecret', () => {
    it.each([
      ['Bearer abc', 'abc'],
      ['bearer   abc ', 'abc'],
      ['Basic abc', ''],
      ['', ''],
      [undefined, ''],
    ])('reads %p as %p', (header, secret) => {
      expect(bearerSecret(header)).toBe(secret);
    });
  });
});
