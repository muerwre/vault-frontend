/** A piece of free text: plain, or a link with the address it leads to. */
export type TextPart =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string };

/**
 * Zones a bare domain needs to count as a link without a path: `example.com`
 * does, `node.js` or `index.html` stay text. With a path, any zone of two
 * letters or more will do, as in `site.xyz/page`.
 */
const ZONES =
  'com|net|org|ru|рф|su|ua|by|kz|io|me|info|dev|app|xyz|online|site|tv|fm|co|us|uk|de|fr|it|es|pl|cz|eu|am|ge|lv|lt|ee|fi|se|no|jp|cn|in|ai|gg|so|to|ly|im|tech|pro|club|space|live|blog|art';

/**
 * Web addresses with a scheme, emails, and bare domains: with a known zone,
 * or any zone followed by a path.
 */
const LINK = new RegExp(
  [
    'https?:\\/\\/[^\\s<>"\']+',
    '[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)*\\.[a-zа-яё]{2,}',
    `(?:www\\.)?[\\wа-яё-]+(?:\\.[\\wа-яё-]+)*\\.(?:(?:${ZONES})(?::\\d+)?(?:\\/[^\\s<>"']*)?(?![\\wа-яё])|[a-zа-яё]{2,}(?::\\d+)?\\/[^\\s<>"']*)`,
  ].join('|'),
  'giu',
);

/** Closing punctuation that ends a sentence rather than the address. */
const TRAILING = /[.,;:!?)\]]$/u;

/** A mark glued to what precedes it is part of other text, not a link. */
const GLUED = /[\p{L}\p{N}_@/:.\\-]/u;

const count = (text: string, char: string) => text.split(char).length - 1;

/** Drops closing punctuation, keeping brackets the address itself opened. */
const trimTrailing = (link: string): string => {
  let result = link;

  while (TRAILING.test(result)) {
    const last = result[result.length - 1];

    if (last === ')' && count(result, '(') >= count(result, ')')) break;
    if (last === ']' && count(result, '[') >= count(result, ']')) break;

    result = result.slice(0, -1);
  }

  return result;
};

/**
 * The address a link leads to. Only `http(s):` and `mailto:` ever come out,
 * whatever the text says, so free text can never smuggle in another scheme.
 */
const toHref = (link: string): string => {
  if (/^https?:\/\//i.test(link)) return link;
  if (link.includes('@') && !link.includes('/')) return `mailto:${link}`;
  return `https://${link}`;
};

/** `https://www.vk.com/id1/` → `vk.com/id1` */
export const prettifyLink = (link: string): string =>
  link
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');

/** Splits free text into plain parts and the links found in it. */
export const linkify = (text: string): TextPart[] => {
  const parts: TextPart[] = [];
  let last = 0;

  for (const match of text.matchAll(LINK)) {
    const start = match.index ?? 0;

    // `ftp://a.com`, `ёmail@x.com`: a piece of something else, not a link
    if (start > 0 && GLUED.test(text[start - 1])) continue;

    const link = trimTrailing(match[0]);

    if (start > last) {
      parts.push({ type: 'text', text: text.slice(last, start) });
    }

    parts.push({ type: 'link', text: prettifyLink(link), href: toHref(link) });
    last = start + link.length;
  }

  if (last < text.length) {
    parts.push({ type: 'text', text: text.slice(last) });
  }

  return parts;
};
