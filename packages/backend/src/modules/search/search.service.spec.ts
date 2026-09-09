import { sanitizeSearchText } from './search.service';

/**
 * The character class decides which queries return anything, so its quirks are
 * pinned deliberately rather than tidied.
 */
describe('sanitizeSearchText', () => {
  it('keeps Cyrillic, word characters and basic punctuation', () => {
    expect(sanitizeSearchText('дом, дерево - 42!?')).toBe('дом, дерево - 42!?');
  });

  it('strips everything else', () => {
    expect(sanitizeSearchText('<script>@#$%^&*()</script>')).toBe('scriptscript');
  });

  it('trims the result', () => {
    expect(sanitizeSearchText('  дом  ')).toBe('дом');
  });

  it('collapses a query of only junk to an empty string', () => {
    expect(sanitizeSearchText('@#$%')).toBe('');
  });

  /** `ё` is outside `А-Яа-я` and is therefore stripped. */
  it('drops ё, which the class does not cover', () => {
    expect(sanitizeSearchText('ёлка')).toBe('лка');
  });
});
