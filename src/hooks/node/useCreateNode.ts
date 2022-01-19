import { useCallback } from 'react';

import { apiPostNode } from '~/api/node';
import { useGetLabNodes } from '~/hooks/lab/useGetLabNodes';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { INode } from '~/types';

export const useCreateNode = () => {
  const flow = useFlowStore();
  const lab = useGetLabNodes();

  return useCallback(
    async (node: INode) => {
      const result = await apiPostNode({ node });

      if (node.is_promoted) {
        flow.setNodes([result.node, ...flow.nodes]);
      } else {
        await lab.unshift({ node: result.node, comment_count: 0, last_seen: node.created_at });
      }
    },
    [flow, lab]
  );
};
