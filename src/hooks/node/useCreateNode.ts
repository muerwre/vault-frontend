import { useCallback } from 'react';
import { INode } from '~/types';
import { apiPostNode } from '~/api/node';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { useGetLabNodes } from '~/hooks/lab/useGetLabNodes';

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
