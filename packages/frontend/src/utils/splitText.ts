import { YOUTUBE_PROVIDER } from '@vault/common/media';

import { flatten, isEmpty } from '~/utils/ramda';

/** Captures every video link, so splitting keeps the links as their own parts. */
const MEDIA_LINK = new RegExp(`(${YOUTUBE_PROVIDER.urlInText.source})`, 'i');

export const splitTextByYoutube = (strings: string[]): string[] =>
  flatten(strings.map((str) => str.split(MEDIA_LINK)));

export const splitTextOmitEmpty = (strings: string[]): string[] =>
  strings.map((el) => el.trim()).filter((el) => !isEmpty(el));
