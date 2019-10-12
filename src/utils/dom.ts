import { IFile } from '~/redux/types';

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

export const getURL = (file: IFile) => {
  if (!file || !file.url) return null;

  return file.url
    .replace('REMOTE_OLD://', process.env.REMOTE_OLD)
    .replace('REMOTE_CURRENT://', process.env.REMOTE_CURRENT);
};

export const getImageSize = (image: string, size?: string): string =>
  `${process.env.API_HOST}${image}`.replace('{size}', size);

export const formatCommentText = (author, text: string) =>
  text
    .replace(/(\n{2,})/gi, '\n')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split('\n')
    .map((el, index) =>
      index === 0 ? `${author ? `<p><b>${author}</b>: ` : ''}${el}</p>` : `<p>${el}</p>`
    )
    .join('');
