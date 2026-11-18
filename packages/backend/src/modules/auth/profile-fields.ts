import {
  MAX_PROFILE_LINK_LENGTH,
  MAX_PROFILE_LINKS,
  NODE_FLOW_DISPLAY,
} from '@vault/common/constants';

type Parsed<T> = { value: T } | { error: string };

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') && !!url.host
    );
  } catch {
    return false;
  }
};

/**
 * Profile links as sent by the client. Entries are trimmed and blank ones
 * dropped, so clearing an input removes the link; what remains must be
 * absolute http(s) URLs.
 */
export const parseProfileLinks = (input: unknown): Parsed<string[]> => {
  if (!Array.isArray(input)) {
    return { error: 'Неверный формат ссылок' };
  }

  if (input.some((link) => typeof link !== 'string')) {
    return { error: 'Неверный формат ссылок' };
  }

  const links = (input as string[]).map((link) => link.trim()).filter(Boolean);

  if (links.length > MAX_PROFILE_LINKS) {
    return { error: `Не больше ${MAX_PROFILE_LINKS} ссылок` };
  }

  if (links.some((link) => link.length > MAX_PROFILE_LINK_LENGTH)) {
    return { error: 'Слишком длинная ссылка' };
  }

  if (!links.every(isHttpUrl)) {
    return { error: 'Это не похоже на ссылку' };
  }

  return { value: links };
};

const DISPLAY_VARIANTS: readonly string[] = Object.values(NODE_FLOW_DISPLAY);

/** About card size. Must be one of the flow-cell variants. */
export const parseAboutDisplay = (input: unknown): Parsed<string> =>
  typeof input === 'string' && DISPLAY_VARIANTS.includes(input)
    ? { value: input }
    : { error: 'Неизвестный размер' };
