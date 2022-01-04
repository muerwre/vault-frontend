import { INode } from '~/redux/types';
import { useDispatch } from 'react-redux';
import { labSeenNode } from '~/redux/lab/actions';
import { useEffect } from 'react';
import { useFlowStore } from '~/store/flow/useFlowStore';

// useOnNodeSeen updates node seen status across all needed places
export const useOnNodeSeen = (node?: INode) => {
  const flow = useFlowStore();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!node?.id) {
      return;
    }

    // Remove node from updated
    if (node.is_promoted) {
      flow.seenNode(node.id);
    } else {
      dispatch(labSeenNode(node.id));
    }
  }, [dispatch, flow, node]);
};
