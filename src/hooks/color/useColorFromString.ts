import { useMemo } from 'react';

import { normalizeBrightColor } from '~/utils/color';
import { stringToColour } from '~/utils/dom';

export const useColorFromString = (val?: string, saturation = 3, lightness = 3) => {
  return useMemo(
    () => (val && normalizeBrightColor(stringToColour(val), saturation, lightness)) || '',
    [lightness, saturation, val]
  );
};
