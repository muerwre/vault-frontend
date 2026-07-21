import differenceInMinutes from 'date-fns/differenceInMinutes';
import differenceInMonths from 'date-fns/differenceInMonths';
import format from 'date-fns/format';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import isAfter from 'date-fns/isAfter';
import ru from 'date-fns/locale/ru';

import {
  COMMENT_BLOCK_DETECTORS,
  COMMENT_BLOCK_TYPES,
  ICommentBlock,
} from '~/constants/comment';
import { headerHeight } from '~/constants/dom';
import { IFile, ValueOf } from '~/types';
import { CONFIG } from '~/utils/config';
import {
  formatExclamations,
  formatTextClickableUsernames,
  formatTextComments,
  formatTextDash,
  formatTextMarkdown,
  formatTextSanitizeTags,
  formatTextSanitizeYoutube,
  formatTextTodos,
} from '~/utils/formatText';
import { pipe } from '~/utils/ramda';
import { splitTextByYoutube, splitTextOmitEmpty } from '~/utils/splitText';

import { ImagePreset } from '../constants/urls';

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number = 0,
  endAngle: number = 360,
): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'L',
    x,
    y,
    'L',
    start.x,
    start.y,
  ].join(' ');
};

export const getURLFromString = (url = '', size?: ImagePreset): string => {
  if (!size) {
    return url.replace('REMOTE_CURRENT://', CONFIG.remoteCurrent);
  }

  return url.replace(
    'REMOTE_CURRENT://',
    `${CONFIG.remoteCurrent}cache/${size}/`,
  );
};

export const getURL = (
  file: Partial<IFile> | undefined,
  size?: ImagePreset,
) => {
  return file?.url ? getURLFromString(file.url, size) : '';
};

export const formatTextWithoutImages = pipe(
  formatTextComments,
  formatExclamations,
  formatTextDash,
  formatTextMarkdown,
  formatTextSanitizeTags,
  formatTextClickableUsernames,
);

export const formatText = pipe(
  formatTextSanitizeYoutube,
  formatTextTodos,
  formatTextWithoutImages,
);

export const formatTextParagraphs = (text: string): string =>
  (text && formatText(text)) || '';

export const findBlockType = (
  line: string,
): ValueOf<typeof COMMENT_BLOCK_TYPES> => {
  const match = Object.values(COMMENT_BLOCK_DETECTORS).find((detector) =>
    line.match(detector.test),
  );
  return (match && match.type) || COMMENT_BLOCK_TYPES.TEXT;
};

export const splitCommentByBlocks = (text: string): ICommentBlock[] =>
  pipe(
    splitTextByYoutube,
    splitTextOmitEmpty,
  )([text]).map((line) => ({
    type: findBlockType(line),
    content: line,
  }));

export const formatCommentText = (
  author?: string,
  text?: string,
): ICommentBlock[] => (author && text ? splitCommentByBlocks(text) : []);

export const getPrettyDate = (date?: string): string => {
  if (!date) {
    return '';
  }

  if (differenceInMonths(new Date(), new Date(date)) >= 3) {
    return format(new Date(date), 'd MMMM yyyy', { locale: ru });
  }

  return isAfter(new Date(date), new Date()) ||
    differenceInMinutes(new Date(), new Date(date)) <= 30
    ? 'Только что'
    : formatDistanceToNow(new Date(date), {
        locale: ru,
        includeSeconds: true,
        addSuffix: true,
      });
};

export const getYoutubeThumb = (url: string) => {
  const match =
    url &&
    url.match(
      /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&(amp;)?[\w?=]*)?/,
    );

  return match && match[1]
    ? `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`
    : null;
};

export const stringToColour = (str: string) => {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let colour = '#';

  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    colour += ('00' + value.toString(16)).substr(-2);
  }

  return colour;
};

export const darken = (col: string, amt: number) => {
  let usePound = false;

  if (col[0] === '#') {
    col = col.slice(1);
    usePound = true;
  }

  const num = parseInt(col, 16);

  let r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  let b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  let g = (num & 0x0000ff) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
};

export const sizeOf = (bytes: number): string => {
  if (bytes === 0) {
    return '0.00 B';
  }
  let e = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B'
  );
};

/** Tells if element is in view */
export const isFullyVisible = (element?: HTMLElement): boolean => {
  if (!element) {
    return false;
  }

  const rect = element.getBoundingClientRect();

  return rect?.top > headerHeight && rect?.bottom < window.innerHeight;
};
