import { useState } from 'react';

import { useGetLabNodes } from '~/hooks/lab/useGetLabNodes';
import { useGetLabStats } from '~/hooks/lab/useGetLabStats';
import { LabNodesSort } from '~/types/lab';

export const useLab = () => {
  const [sort, setSort] = useState<LabNodesSort>(LabNodesSort.New);

  const { nodes, isLoading, loadMore, hasMore } = useGetLabNodes(sort);
  const { tags, heroes, updates, isLoading: isLoadingStats } = useGetLabStats();

  return {
    isLoading,
    nodes,
    hasMore,
    loadMore,
    tags,
    heroes,
    isLoadingStats,
    updates,
    sort,
    setSort,
  };
};
