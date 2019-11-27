import { IFile, ValueOf } from '~/redux/types';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import isAfter from 'date-fns/isAfter';
import differenceInMonths from 'date-fns/differenceInMonths';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import ru from 'date-fns/locale/ru';
import Axios from 'axios';
import { PRESETS } from '~/constants/urls';
import { ICommentBlock, COMMENT_BLOCK_DETECTORS, COMMENT_BLOCK_TYPES } from '~/constants/comment';
import format from 'date-fns/format';

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

export const getURL = (file: Partial<IFile>, size?: typeof PRESETS[keyof typeof PRESETS]) => {
  if (!file || !file.url) return null;

  if (size) {
    return file.url
      .replace('REMOTE_CURRENT://', `${process.env.REMOTE_CURRENT}cache/${size}/`)
      .replace('REMOTE_OLD://', process.env.REMOTE_OLD);
  }

  return file.url
    .replace('REMOTE_CURRENT://', process.env.REMOTE_CURRENT)
    .replace('REMOTE_OLD://', process.env.REMOTE_OLD);
};

export const formatText = (text: string): string =>
  !text
    ? ''
    : text
        .replace(
          /(https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch)?(\?v=)?[\w\-\&\=]+)/gim,
          '\n$1\n'
        )
        .replace(/\n{1,}/gim, '\n')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(
          /~([\wа-яА-Я\-]+)/giu,
          '<span class="username" onClick="window.postMessage({ type: \'username\', username: \'$1\'});">~$1</span>'
        )
        .replace(/:\/\//gim, ':|--|')
        .replace(/(\/\/[^\n]+)/gim, '<span class="grey">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/gim, '<span class="grey">$1</span>')
        .replace(/:\|--\|/gim, '://')
        .split('\n')
        .filter(el => el.trim().length)
        .join('\n');

export const formatTextParagraphs = (text: string): string =>
  (text &&
    formatText(text)
      .split('\n')
      .map(str => `<p>${str}</p>`)
      .join('\n')) ||
  null;

export const findBlockType = (line: string): ValueOf<typeof COMMENT_BLOCK_TYPES> => {
  const match = Object.values(COMMENT_BLOCK_DETECTORS).find(detector => line.match(detector.test));
  return (match && match.type) || COMMENT_BLOCK_TYPES.TEXT;
};

export const splitCommentByBlocks = (text: string): ICommentBlock[] =>
  text.split('\n').map(line => ({
    type: findBlockType(line),
    content: line,
  }));

export const formatCommentText = (author: string, text: string): ICommentBlock[] =>
  text ? splitCommentByBlocks(formatText(text)) : null;

export const formatCellText = (text: string): string => formatText(text);

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
