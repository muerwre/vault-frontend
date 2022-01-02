import { useLoadNode } from '~/hooks/node/useLoadNode';
import { useCallback } from 'react';
import { INode } from '~/redux/types';
import { apiPostNode } from '~/redux/node/api';
import { selectFlowNodes } from '~/redux/flow/selectors';
import { flowSetNodes } from '~/redux/flow/actions';
import { selectLabListNodes } from '~/redux/lab/selectors';
import { labSetList } from '~/redux/lab/actions';
import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { useDispatch } from 'react-redux';

export const useUpdateNode = (id: number) => {
  const dispatch = useDispatch();
  const { update } = useLoadNode(id);
  const flowNodes = useShallowSelect(selectFlowNodes);
  const labNodes = useShallowSelect(selectLabListNodes);

  return useCallback(
    async (node: INode) => {
      const result = await apiPostNode({ node });

      if (!update) {
        return;
      }

      await update(result.node);

      // TODO: use another store here someday
      if (node.is_promoted) {
        const updatedNodes = flowNodes.map(item =>
          item.id === result.node.id ? result.node : item
        );
        dispatch(flowSetNodes(updatedNodes));
      } else {
        const updatedNodes = labNodes.map(item =>
          item.node.id === result.node.id ? { ...item, node: result.node } : item
        );
        dispatch(labSetList({ nodes: updatedNodes }));
      }
    },
    [update, flowNodes, dispatch, labNodes]
  );
};
