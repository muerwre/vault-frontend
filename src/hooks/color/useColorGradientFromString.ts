import { useMemo } from 'react';

import { generateGradientFromColor } from '~/utils/color';

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
