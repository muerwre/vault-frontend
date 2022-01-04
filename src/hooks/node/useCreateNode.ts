import { useCallback } from 'react';
import { INode } from '~/redux/types';
import { apiPostNode } from '~/api/node';
import { selectLabListNodes } from '~/redux/lab/selectors';
import { labSetList } from '~/redux/lab/actions';
import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { useDispatch } from 'react-redux';
import { useFlowStore } from '~/store/flow/useFlowStore';

export const useCreateNode = () => {
  const dispatch = useDispatch();
  const flow = useFlowStore();
  const labNodes = useShallowSelect(selectLabListNodes);

  return useCallback(
    async (node: INode) => {
      const result = await apiPostNode({ node });

      if (node.is_promoted) {
        flow.setNodes([result.node, ...flow.nodes]);
      } else {
        const updatedNodes = [
          { node: result.node, comment_count: 0, last_seen: node.created_at },
          ...labNodes,
        ];
        dispatch(labSetList({ nodes: updatedNodes }));
      }
    },
    [flow, labNodes, dispatch]
  );
};
