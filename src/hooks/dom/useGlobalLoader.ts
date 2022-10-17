import { useEffect } from 'react';

import { useAuth } from '~/hooks/auth/useAuth';
import { useFlowLoader } from '~/hooks/flow/useFlowLoader';
import { useLab } from '~/hooks/lab/useLab';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { hideLoader } from '~/utils/dom/hideLoader';

/** simply waits for all data to settle and then show the app */
export const useGlobalLoader = () => {
  const { getInitialNodes } = useFlowLoader();
  const {
    loadMore: loadLabNodes,
    nodes: labNodes,
    isLoading: isLoadingLab,
  } = useLab();
  const { isUser } = useAuth();

  const flow = useFlowStore();

  useEffect(() => {
    if (!flow.isRefreshed) {
      void getInitialNodes().then(() => {
        if (!isUser || isLoadingLab || labNodes.length) return;

        return loadLabNodes();
      });
      return;
    }

    hideLoader();
  }, [flow.isRefreshed, getInitialNodes]);

  useEffect(() => {
    void getInitialNodes();
  }, [isUser]);
};
