import { darken, desaturate, parseToHsla } from 'color2k';
import { DEFAULT_DOMINANT_COLOR } from '~/constants/node';

export const normalizeBrightColor = (color?: string) => {
  if (!color) {
    return undefined;
  }

  const hsla = parseToHsla(color || DEFAULT_DOMINANT_COLOR);
  const saturation = hsla[1];
  const lightness = hsla[2];

  const desaturated = desaturate(color, saturation ** 3);
  return darken(desaturated, lightness ** 3);
};
