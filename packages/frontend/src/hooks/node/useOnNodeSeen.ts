import { useEffect } from 'react';

import { useGetLabStats } from '~/hooks/lab/useGetLabStats';
import { useFlowStore } from '~/store/flow/useFlowStore';
import { INode } from '~/types';
import { isLabNode } from '~/utils/node';

// useOnNodeSeen updates node seen status across all needed places
export const useOnNodeSeen = (node?: INode) => {
  const labStats = useGetLabStats();
  const flow = useFlowStore();

  useEffect(() => {
    if (!node?.id) {
      return;
    }

    // Remove node from updated
    if (isLabNode(node)) {
      void labStats.seenNode(node.id);
    } else {
      flow.seenNode(node.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node?.id]);
};
