import { useMemo } from 'react';
import { adjustHue } from 'color2k';
import { useColorFromString } from '~/utils/hooks/useColorFromString';
import { normalizeBrightColor } from '~/utils/color';

export const useColorGradientFromString = (val?: string, saturation = 3, lightness = 3) => {
  return useMemo(() => {
    if (!val) {
      return '';
    }

    const color = useColorFromString(val, saturation, lightness);
    const second = normalizeBrightColor(adjustHue(color, 45), saturation, lightness);
    const third = normalizeBrightColor(adjustHue(color, 90), saturation, lightness);

    return `linear-gradient(155deg, ${color}, ${second}, ${third})`;
  }, [val]);
};
