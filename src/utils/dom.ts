import { IFile } from '~/redux/types';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { ru } from 'date-fns/locale';
import Axios from 'axios';

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

export const getURL = (file: Partial<IFile>) => {
  if (!file || !file.url) return null;

  return file.url
    .replace('REMOTE_CURRENT://', process.env.REMOTE_CURRENT)
    .replace('REMOTE_OLD://', process.env.REMOTE_OLD);
};

export const getImageSize = (file: IFile, size?: string): string => getURL(file);
// `${process.env.API_HOST}${image}`.replace('{size}', size);

export const formatText = (text: string): string =>
  !text
    ? ''
    : text
        .replace(/(\n{2,})/gi, '\n')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/:\/\//gim, ':|--|')
        .replace(/(\/\/[^\n]+)/gim, '<span class="grey">$1</span>')
        .replace(/:\|--\|/gim, '://')
        .split('\n')
        .map(el => `<p>${el}</p>`)
        .join('');

export const formatCommentText = (author: string, text: string): string =>
  text
    ? formatText(text).replace(
        /^<p>/,
        author ? `<p><b class="comment-author">${author}: </b>` : '<p>'
      )
    : '';

export const formatCellText = (text: string): string => formatText(text);

export const getPrettyDate = (date: string): string =>
  formatDistanceToNow(new Date(date), { locale: ru, includeSeconds: true, addSuffix: true });

export const getYoutubeTitle = async (id: string) => {
  Axios.get(`http://youtube.com/get_video_info?video_id=${id}`).then(console.log);
};

(<any>window).getYoutubeTitle = getYoutubeTitle;
