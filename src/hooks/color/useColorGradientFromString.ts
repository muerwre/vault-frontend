import { useMemo } from 'react';

import { adjustHue } from 'color2k';

import { generateGradientFromColor, normalizeBrightColor } from '~/utils/color';
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

    return generateGradientFromColor(val, saturation, lightness, angle);
  }, [angle, lightness, saturation, val]);
