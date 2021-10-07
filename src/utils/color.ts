import { darken, desaturate, parseToHsla } from 'color2k';
import { DEFAULT_DOMINANT_COLOR } from '~/constants/node';

export const normalizeBrightColor = (color?: string) => {
  if (!color) {
    return undefined;
  }

  const hsla = parseToHsla(color || DEFAULT_DOMINANT_COLOR);
  const saturation = hsla[1];
  const lightness = hsla[2];

  const desaturated = saturation > 0.3 ? desaturate(color, Math.min(saturation, 0.4)) : color;
  return lightness > 0.3 ? darken(desaturated, Math.min(lightness, 0.2)) : desaturated;
};
