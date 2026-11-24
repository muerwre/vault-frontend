import { useCallback } from 'react';

import { NODE_PLACEMENT } from '@vault/common/constants';

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

      const placement = result.node.is_promoted;

      if (placement === NODE_PLACEMENT.FLOW) {
        flow.setNodes([result.node, ...flow.nodes]);
      } else if (placement === NODE_PLACEMENT.LAB) {
        await lab.unshift({
          node: result.node,
          comment_count: 0,
          last_seen: node.created_at,
        });
      }

      return result.node;
    },
    [flow, lab],
  );
};
