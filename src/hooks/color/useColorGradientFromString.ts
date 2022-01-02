import { useMemo } from 'react';
import { adjustHue } from 'color2k';
import { normalizeBrightColor } from '~/utils/color';
import { stringToColour } from '~/utils/dom';

export const useColorGradientFromString = (
  val?: string,
  saturation = 3,
  lightness = 3,
  angle = 155
) =>
  useMemo(() => {
    if (!val) {
      return '';
    }

    const color = normalizeBrightColor(stringToColour(val), saturation, lightness);
    const second = normalizeBrightColor(adjustHue(color, 45), saturation, lightness);
    const third = normalizeBrightColor(adjustHue(color, 90), saturation, lightness);

    return `linear-gradient(${angle}deg, ${color}, ${second}, ${third})`;
  }, [angle, lightness, saturation, val]);
