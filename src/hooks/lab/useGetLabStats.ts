import useSWR from 'swr';
import { API } from '~/constants/api';
import { getLabStats, getLabUpdates } from '~/api/lab';
import { useLabStore } from '~/store/lab/useLabStore';
import { useCallback, useEffect } from 'react';
import { useUser } from '~/hooks/user/userUser';

const refreshInterval = 1000 * 60 * 5; // 5 minutes

export const useGetLabStats = () => {
  const lab = useLabStore();
  const { is_user } = useUser();

  const { data: stats, isValidating: isValidatingStats } = useSWR(
    is_user ? API.LAB.STATS : null,
    async () => getLabStats(),
    {
      fallbackData: {
        heroes: lab.heroes,
        tags: lab.tags,
      },
      onSuccess: data => {
        lab.setHeroes(data.heroes);
        lab.setTags(data.tags);
      },
      refreshInterval,
    }
  );

  const { data: updatesData, isValidating: isValidatingUpdates, mutate: mutateUpdates } = useSWR(
    is_user ? API.LAB.UPDATES : null,
    async () => {
      const result = await getLabUpdates();
      return result.nodes;
    },
    {
      fallbackData: lab.updates,
      onSuccess: data => {
        lab.setUpdates(data);
      },
      refreshInterval,
    }
  );

  const heroes = stats?.heroes || [];
  const tags = stats?.tags || [];
  const updates = updatesData || [];

  const isLoading = (!stats || !updates) && (isValidatingStats || isValidatingUpdates);
  const seenNode = useCallback(
    async (nodeId: number) => {
      await mutateUpdates(
        updates.filter(it => it.id !== nodeId),
        false
      );
    },
    [mutateUpdates, updates]
  );

  /** purge cache on exit */
  useEffect(() => {
    if (is_user) {
      return;
    }

    lab.setHeroes([]);
    lab.setTags([]);
    lab.setUpdates([]);
  }, [is_user, lab]);

  return { heroes, tags, updates, isLoading, seenNode };
};
