import { useLoadNode } from '~/hooks/node/useLoadNode';
import { useCallback } from 'react';
import { INode } from '~/redux/types';
import { apiPostNode } from '~/api/node';
import { useDispatch } from 'react-redux';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { useGetLabNodes } from '~/hooks/lab/useGetLabNodes';

export const useUpdateNode = (id: number) => {
  const dispatch = useDispatch();
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
    [update, flow, lab]
  );
};
