import { INode } from '~/redux/types';
import { useEffect } from 'react';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { useGetLabStats } from '~/hooks/lab/useGetLabStats';

// useOnNodeSeen updates node seen status across all needed places
export const useOnNodeSeen = (node?: INode) => {
  const labStats = useGetLabStats();
  const flow = useFlowStore();

  useEffect(() => {
    if (!node?.id) {
      return;
    }

    // Remove node from updated
    if (node.is_promoted) {
      flow.seenNode(node.id);
    } else {
      void labStats.seenNode(node.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node?.id]);
};
