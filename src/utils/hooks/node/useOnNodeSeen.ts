import { INode } from '~/redux/types';
import { useDispatch } from 'react-redux';
import { labSeenNode } from '~/redux/lab/actions';
import { flowSeenNode } from '~/redux/flow/actions';

// useOnNodeSeen updates node seen status across all needed places
export const useOnNodeSeen = (node: INode) => {
  const dispatch = useDispatch();

  // Remove node from updated
  if (node.is_promoted) {
    dispatch(flowSeenNode(node.id));
  } else {
    dispatch(labSeenNode(node.id));
  }
};
