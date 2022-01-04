import { useEffect } from 'react';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { hideLoader } from '~/utils/dom/hideLoader';
import { useFlowLoader } from '~/hooks/flow/useFlowLoader';

/** simply waits for all data to settle and then show the app */
export const useGlobalLoader = () => {
  useFlowLoader();

  const flow = useFlowStore();

  useEffect(() => {
    if (!flow.isRefreshed) {
      return;
    }

    hideLoader();
  }, [flow.isRefreshed]);
};
