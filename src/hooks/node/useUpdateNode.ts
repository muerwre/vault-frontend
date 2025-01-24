import { useCallback } from 'react';

import { apiPostNode } from '~/api/node';
import { useGetLabNodes } from '~/hooks/lab/useGetLabNodes';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { INode } from '~/types';

export const useUpdateNode = (id: number) => {
  const { update } = useLoadNode(id);
  const flow = useFlowStore();
  const lab = useGetLabNodes();

  return useCallback(
    async (node: INode) => {
      const result = await apiPostNode({ node });

      if (!update) {
        return;
      }

      await update(result.node);

      if (node.is_promoted) {
        flow.updateNode(result.node.id!, result.node);
      } else {
        await lab.updateNode(result.node.id!, result.node);
      }
    },
    [update, flow, lab],
  );
};
