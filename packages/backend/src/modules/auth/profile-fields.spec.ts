import { parseAboutDisplay, parseProfileLinks } from './profile-fields';

describe('profile fields', () => {
  describe('parseProfileLinks', () => {
    it('accepts up to four http(s) links', () => {
      const links = [
        'https://vk.com/id1',
        'http://example.com',
        'https://t.me/someone',
        'https://github.com/someone',
      ];

      expect(parseProfileLinks(links)).toEqual({ value: links });
    });

    it('trims entries and drops blank ones', () => {
      expect(parseProfileLinks([' https://a.com ', '', '   '])).toEqual({
        value: ['https://a.com'],
      });
    });

    it('accepts an empty list, which clears the links', () => {
      expect(parseProfileLinks([])).toEqual({ value: [] });
    });

    it('rejects more than four links', () => {
      expect(
        parseProfileLinks([
          'https://a.com',
          'https://b.com',
          'https://c.com',
          'https://d.com',
          'https://e.com',
        ]),
      ).toEqual({ error: expect.any(String) });
    });

    it('counts only non-blank entries against the limit', () => {
      expect(
        parseProfileLinks([
          'https://a.com',
          '',
          'https://b.com',
          'https://c.com',
          'https://d.com',
        ]),
      ).toEqual({ value: expect.any(Array) });
    });

    it.each([
      ['a relative path', '/node/1'],
      ['a bare word', 'hello'],
      ['another scheme', 'javascript:alert(1)'],
      ['a data url', 'data:text/html,hi'],
    ])('rejects %s', (_, link) => {
      expect(parseProfileLinks([link])).toEqual({ error: expect.any(String) });
    });

    it('rejects an overlong link', () => {
      expect(parseProfileLinks([`https://a.com/${'x'.repeat(300)}`])).toEqual({
        error: expect.any(String),
      });
    });

    it.each([
      ['a string', 'https://a.com'],
      ['null', null],
      ['numbers', [1]],
    ])('rejects %s instead of an array of strings', (_, input) => {
      expect(parseProfileLinks(input)).toEqual({
        error: expect.any(String),
      });
    });
  });

  describe('parseAboutDisplay', () => {
    it.each(['single', 'vertical', 'horizontal', 'quadro'])(
      'accepts %s',
      (display) => {
        expect(parseAboutDisplay(display)).toEqual({ value: display });
      },
    );

    it.each([[''], ['huge'], [null], [1]])('rejects %p', (display) => {
      expect(parseAboutDisplay(display)).toEqual({
        error: expect.any(String),
      });
    });
  });
});
