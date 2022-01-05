import { useGetLabNodes } from '~/hooks/lab/useGetLabNodes';
import { useGetLabStats } from '~/hooks/lab/useGetLabStats';

export const useLab = () => {
  const { nodes, isLoading, loadMore, hasMore } = useGetLabNodes();
  const { tags, heroes, updates, isLoading: isLoadingStats } = useGetLabStats();

  return { isLoading, nodes, hasMore, loadMore, tags, heroes, isLoadingStats, updates };
};
