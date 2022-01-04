import { useLoadNode } from '~/hooks/node/useLoadNode';
import { useCallback } from 'react';
import { INode } from '~/redux/types';
import { apiPostNode } from '~/api/node';
import { selectLabListNodes } from '~/redux/lab/selectors';
import { labSetList } from '~/redux/lab/actions';
import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { useDispatch } from 'react-redux';
import { useFlowStore } from '~/store/flow/useFlowStore';

export const useUpdateNode = (id: number) => {
  const dispatch = useDispatch();
  const { update } = useLoadNode(id);
  const flow = useFlowStore();
  const labNodes = useShallowSelect(selectLabListNodes);

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
        const updatedNodes = labNodes.map(item =>
          item.node.id === result.node.id ? { ...item, node: result.node } : item
        );
        dispatch(labSetList({ nodes: updatedNodes }));
      }
    },
    [update, flow, labNodes, dispatch]
  );
};
