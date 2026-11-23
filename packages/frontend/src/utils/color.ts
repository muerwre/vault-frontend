import type { CSSProperties } from 'react';

import {
  adjustHue,
  darken,
  desaturate,
  getLuminance,
  hsla,
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
 * With dark text, the greys (dates, counters, icons) follow it as a lighter
 * shade, through `--photo_muted`.
 */
export const getPhotoBackdrop = (
  color?: string,
): CSSProperties & { '--photo_muted'?: string } => {
  if (!color) {
    return {};
  }

  const backgroundColor = transparentize(color, 0.5);

  if (getLuminance(color) <= 0.4) {
    return { backgroundColor };
  }

  const text = desaturate(darken(color, 0.5), 0.1);

  return {
    backgroundColor,
    color: text,
    '--photo_muted': transparentize(text, 0.35),
  };
};

/** Lightness the dark tint never goes over, and how much of it covers. */
const SHADE_MAX_LIGHTNESS = 0.18;
const SHADE_OPACITY = 0.7;

/**
 * A dark shade of the photo's colour over its blurred photo, for the cards of
 * text and song posts: bright photos stay as dark as dim ones, so the light
 * text over them always reads.
 */
export const getPhotoShade = (color?: string): CSSProperties => {
  if (!color) {
    return {};
  }

  const [hue, saturation, lightness] = parseToHsla(color);

  return {
    backgroundColor: hsla(
      hue,
      saturation,
      Math.min(lightness, SHADE_MAX_LIGHTNESS),
      SHADE_OPACITY,
    ),
  };
};
