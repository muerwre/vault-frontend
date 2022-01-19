import { useEffect } from 'react';

import { useFlowLoader } from '~/hooks/flow/useFlowLoader';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { hideLoader } from '~/utils/dom/hideLoader';

/** simply waits for all data to settle and then show the app */
export const useGlobalLoader = () => {
  const { getInitialNodes } = useFlowLoader();
  const flow = useFlowStore();

  useEffect(() => {
    if (!flow.isRefreshed) {
      void getInitialNodes();
      return;
    }

    hideLoader();
  }, [flow.isRefreshed, getInitialNodes]);
};
