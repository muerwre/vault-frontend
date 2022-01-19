import { useCallback } from 'react';

import { experimentalFeatures } from '~/constants/features';
import { usePersistedState } from '~/hooks/data/usePersistedState';

enum Layout {
  Fluid = 'fluid',
  Default = 'default',
}

export const useFlowLayout = () => {
  const [layout, setLayout] = usePersistedState('flow_layout', Layout.Default);
  const isFluid = layout === Layout.Fluid && experimentalFeatures.liquidFlow;

  const toggleLayout = useCallback(() => {
    setLayout(isFluid ? Layout.Default : Layout.Fluid);
  }, [setLayout, isFluid]);

  return { isFluid, toggleLayout };
};
