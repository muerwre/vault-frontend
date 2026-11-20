import {
  adjustHue,
  darken,
  desaturate,
  getLuminance,
  parseToHsla,
  transparentize,
} from 'color2k';

import { DEFAULT_DOMINANT_COLOR } from '~/constants/node';
import { stringToColour } from '~/utils/dom';

export const normalizeBrightColor = (
  color?: string,
  saturationExp = 3,
  lightnessExp = 3,
) => {
  if (!color) {
    return '';
  }

  const hsla = parseToHsla(color || DEFAULT_DOMINANT_COLOR);
  const saturation = hsla[1];
  const lightness = hsla[2];

  const desaturated =
    saturationExp > 1 ? desaturate(color, saturation ** saturationExp) : color;
  return lightnessExp > 1
    ? darken(desaturated, lightness ** lightnessExp)
    : desaturated;
};

export const generateColorTriplet = (
  val: string,
  saturation: number,
  lightness: number,
) => {
  const color = normalizeBrightColor(
    stringToColour(val),
    saturation,
    lightness,
  );

  return [
    color,
    normalizeBrightColor(adjustHue(color, 45), saturation, lightness),
    normalizeBrightColor(adjustHue(color, 90), saturation, lightness),
  ];
};

export const generateGradientFromColor = (
  val: string,
  saturation = 3,
  lightness = 3,
  angle = 155,
  opacity = 1,
) => {
  const [first, second, third] = generateColorTriplet(
    val,
    saturation,
    lightness,
  ).map((it) => {
    if (opacity > 1 || opacity < 0) {
      return it;
    }

    return transparentize(it, 1 - opacity);
  });

  return `linear-gradient(${angle}deg, ${first}, ${second}, ${third})`;
};

/**
 * How text sits over a photo, tinted with the photo's colour: the colour at
 * half opacity behind it, and dark text instead of light on a bright one.
 */
export const getPhotoBackdrop = (
  color?: string,
): { backgroundColor?: string; color?: string } => {
  if (!color) {
    return {};
  }

  return {
    backgroundColor: transparentize(color, 0.5),
    color:
      getLuminance(color) > 0.4
        ? desaturate(darken(color, 0.5), 0.1)
        : undefined,
  };
};
