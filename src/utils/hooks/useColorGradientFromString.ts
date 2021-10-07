import { useMemo } from 'react';
import { adjustHue } from 'color2k';
import { useColorFromString } from '~/utils/hooks/useColorFromString';
import { normalizeBrightColor } from '~/utils/color';

export const useColorGradientFromString = (val?: string, saturation = 3, lightness = 3) => {
  const color = useColorFromString(val, saturation, lightness);
  return useMemo(
    () =>
      val
        ? `linear-gradient(155deg, ${color}, ${normalizeBrightColor(
            adjustHue(color, 80),
            saturation,
            lightness
          )})`
        : '',
    [color]
  );
};
