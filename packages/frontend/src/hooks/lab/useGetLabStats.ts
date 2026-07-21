import { useCallback, useMemo } from 'react';

import useSWR from 'swr';

import { getLabStats, getLabUpdates } from '~/api/lab';
import { API } from '~/constants/api';
import { useAuth } from '~/hooks/auth/useAuth';
import { useLabStore } from '~/store/lab/useLabStore';

const refreshInterval = 1000 * 60 * 5; // 5 minutes

export const useGetLabStats = () => {
  const lab = useLabStore();
  const { isUser } = useAuth();

  const { data: stats, isValidating: isValidatingStats } = useSWR(
    isUser ? API.LAB.STATS : null,
    async () => getLabStats(),
    {
      fallbackData: {
        heroes: lab.heroes,
        tags: lab.tags,
      },
      onSuccess: (data) => {
        lab.setHeroes(data.heroes);
        lab.setTags(data.tags);
      },
      refreshInterval,
    },
  );

  const {
    data: updatesData,
    isValidating: isValidatingUpdates,
    mutate: mutateUpdates,
  } = useSWR(
    isUser ? API.LAB.UPDATES : null,
    async () => {
      const result = await getLabUpdates();
      return result.nodes;
    },
    {
      fallbackData: lab.updates,
      onSuccess: (data) => {
        lab.setUpdates(data);
      },
      refreshInterval,
    },
  );

  const heroes = useMemo(() => stats?.heroes || [], [stats]);
  const tags = useMemo(() => stats?.tags || [], [stats]);
  const updates = useMemo(() => updatesData || [], [updatesData]);

  const isLoading =
    (!stats || !updates) && (isValidatingStats || isValidatingUpdates);
  const seenNode = useCallback(
    async (nodeId: number) => {
      await mutateUpdates(
        updates.filter((it) => it.id !== nodeId),
        false,
      );
    },
    [mutateUpdates, updates],
  );

  return { heroes, tags, updates, isLoading, seenNode };
};
