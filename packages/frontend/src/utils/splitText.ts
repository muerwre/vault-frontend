import { splitByMediaLinks } from '@vault/common/media';

import { flatten, isEmpty } from '~/utils/ramda';

/** Video links become parts of their own; the text around them is kept whole. */
export const splitTextByYoutube = (strings: string[]): string[] =>
  flatten(strings.map(splitByMediaLinks));

export const splitTextOmitEmpty = (strings: string[]): string[] =>
  strings.map((el) => el.trim()).filter((el) => !isEmpty(el));
