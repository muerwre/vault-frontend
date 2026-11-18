import { isEmail, isSameEmail, normalizeEmail } from './email';

describe('email helpers', () => {
  it('normalizes by trimming and lower-casing', () => {
    expect(normalizeEmail('  Some.One@Example.COM ')).toBe(
      'some.one@example.com',
    );
  });

  it.each(['a@b', 'some.one+tag@example.com'])('accepts %s', (value) => {
    expect(isEmail(value)).toBe(true);
  });

  it.each([
    '',
    'nope',
    '@b',
    'a@',
    'a b@c',
    'a@b@c',
    `${'a'.repeat(250)}@b.com`,
  ])('rejects %j', (value) => {
    expect(isEmail(value)).toBe(false);
  });

  it('compares ignoring case, spaces and null', () => {
    expect(isSameEmail('A@B.c', ' a@b.c ')).toBe(true);
    expect(isSameEmail(null, '')).toBe(true);
    expect(isSameEmail('a@b.c', 'x@b.c')).toBe(false);
  });
});
