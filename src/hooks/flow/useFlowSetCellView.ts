import { useFlowStore } from '~/store/flow/useFlowStore';
import { useCallback } from 'react';
import { FlowDisplay } from '~/types';
import { showErrorToast } from '~/utils/errors/showToast';
import { postCellView } from '~/api/flow';

export const useFlowSetCellView = () => {
  const { updateNode } = useFlowStore();

  return useCallback(
    async (id, flow: FlowDisplay) => {
      try {
        updateNode(id, { flow });
        await postCellView({ id, flow });
      } catch (error) {
        showErrorToast(error);
      }
    },
    [updateNode]
  );
};
