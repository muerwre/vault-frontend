import { darken, desaturate, parseToHsla } from 'color2k';

import { DEFAULT_DOMINANT_COLOR } from '~/constants/node';

export const normalizeBrightColor = (color?: string, saturationExp = 3, lightnessExp = 3) => {
  if (!color) {
    return '';
  }

  const hsla = parseToHsla(color || DEFAULT_DOMINANT_COLOR);
  const saturation = hsla[1];
  const lightness = hsla[2];

  const desaturated = saturationExp > 1 ? desaturate(color, saturation ** saturationExp) : color;
  return lightnessExp > 1 ? darken(desaturated, lightness ** lightnessExp) : desaturated;
};
