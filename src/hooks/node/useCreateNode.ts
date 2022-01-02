import { useCallback } from 'react';
import { INode } from '~/redux/types';
import { apiPostNode } from '~/redux/node/api';
import { selectFlowNodes } from '~/redux/flow/selectors';
import { flowSetNodes } from '~/redux/flow/actions';
import { selectLabListNodes } from '~/redux/lab/selectors';
import { labSetList } from '~/redux/lab/actions';
import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { useDispatch } from 'react-redux';

export const useCreateNode = () => {
  const dispatch = useDispatch();
  const flowNodes = useShallowSelect(selectFlowNodes);
  const labNodes = useShallowSelect(selectLabListNodes);

  return useCallback(
    async (node: INode) => {
      const result = await apiPostNode({ node });

      // TODO: use another store here someday
      if (node.is_promoted) {
        const updatedNodes = [result.node, ...flowNodes];
        dispatch(flowSetNodes(updatedNodes));
      } else {
        const updatedNodes = [
          { node: result.node, comment_count: 0, last_seen: node.created_at },
          ...labNodes,
        ];
        dispatch(labSetList({ nodes: updatedNodes }));
      }
    },
    [flowNodes, labNodes, dispatch]
  );
};
