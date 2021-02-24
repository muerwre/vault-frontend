import { IFile, ValueOf } from '~/redux/types';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import isAfter from 'date-fns/isAfter';
import differenceInMonths from 'date-fns/differenceInMonths';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import ru from 'date-fns/locale/ru';
import Axios from 'axios';
import { PRESETS } from '~/constants/urls';
import { COMMENT_BLOCK_DETECTORS, COMMENT_BLOCK_TYPES, ICommentBlock } from '~/constants/comment';
import format from 'date-fns/format';
import { pipe } from 'ramda';
import {
  formatDash,
  formatExclamations,
  formatMarkdown,
  formatTextClickableUsernames,
  formatTextComments,
  formatTextSanitizeTags,
  formatTextSanitizeYoutube,
  formatTextTodos,
} from '~/utils/formatText';
import { splitTextByYoutube, splitTextOmitEmpty } from '~/utils/splitText';

export const getStyle = (oElm: any, strCssRule: string) => {
  if (document.defaultView && document.defaultView.getComputedStyle) {
    return document.defaultView.getComputedStyle(oElm, '').getPropertyValue(strCssRule);
  }

  if (oElm.currentStyle) {
    return oElm.currentStyle[strCssRule.replace(/-(\w)/g, (strMatch, p1) => p1.toUpperCase())];
  }

  return '';
};

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
  endAngle: number = 360
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

export const getURLFromString = (
  url: string,
  size?: typeof PRESETS[keyof typeof PRESETS]
): string => {
  if (size) {
    return url
      .replace('REMOTE_CURRENT://', `${process.env.REACT_APP_REMOTE_CURRENT}cache/${size}/`)
      .replace('REMOTE_OLD://', process.env.REACT_APP_REMOTE_OLD);
  }

  return url
    .replace('REMOTE_CURRENT://', process.env.REACT_APP_REMOTE_CURRENT)
    .replace('REMOTE_OLD://', process.env.REACT_APP_REMOTE_OLD);
};

export const getURL = (file: Partial<IFile>, size?: typeof PRESETS[keyof typeof PRESETS]) => {
  return file?.url ? getURLFromString(file.url, size) : null;
};

export const formatText = pipe(
  formatTextSanitizeTags,
  formatTextSanitizeYoutube,
  formatTextClickableUsernames,
  formatTextComments,
  formatTextTodos,
  formatExclamations,
  formatDash,
  formatMarkdown
);

export const formatTextParagraphs = (text: string): string => (text && formatText(text)) || null;

export const findBlockType = (line: string): ValueOf<typeof COMMENT_BLOCK_TYPES> => {
  const match = Object.values(COMMENT_BLOCK_DETECTORS).find(detector => line.match(detector.test));
  return (match && match.type) || COMMENT_BLOCK_TYPES.TEXT;
};

export const splitCommentByBlocks = (text: string): ICommentBlock[] =>
  pipe(
    splitTextByYoutube,
    splitTextOmitEmpty
  )([text]).map(line => ({
    type: findBlockType(line),
    content: line,
  }));

export const formatCommentText = (author: string, text: string): ICommentBlock[] =>
  text ? splitCommentByBlocks(formatText(text)) : null;

export const formatCellText = (text: string): string => formatTextParagraphs(text);

export const getPrettyDate = (date: string): string => {
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

export const getYoutubeTitle = async (id: string) => {
  Axios.get(`http://youtube.com/get_video_info?video_id=${id}`).then(console.log);
};

export const getYoutubeThumb = (url: string) => {
  const match =
    url &&
    url.match(
      /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?[\w\?=]*)?/
    );

  return match && match[1] ? `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg` : null;
};

export function plural(n: number, one: string, two: string, five: string) {
  if (n % 10 === 1 && n % 100 !== 11) {
    return `${n} ${one}`;
  } else if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) {
    return `${n} ${two}`;
  } else {
    return `${n} ${five}`;
  }
}

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
  var usePound = false;

  if (col[0] == '#') {
    col = col.slice(1);
    usePound = true;
  }

  var num = parseInt(col, 16);

  var r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  var b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  var g = (num & 0x0000ff) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
};

export const sizeOf = (bytes: number): string => {
  if (bytes == 0) {
    return '0.00 B';
  }
  var e = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B';
};
