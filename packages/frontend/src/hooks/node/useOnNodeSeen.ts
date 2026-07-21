import { useEffect } from 'react';

import { useGetLabStats } from '~/hooks/lab/useGetLabStats';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { INode } from '~/types';

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
