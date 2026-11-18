import { useCallback, useMemo } from 'react';

import useSWR from 'swr';

import { getLabStats, getLabUpdates } from '~/api/lab';
import { API } from '~/constants/api';
import { useAuth } from '~/hooks/auth/useAuth';
import { useLabStore } from '~/store/lab/useLabStore';

const refreshInterval = 1000 * 60 * 5; // 5 minutes

/** Per viewer, so one user's lab never shows up for the next, or for a guest. */
const getKey = (url: string, userId?: number) =>
  userId ? JSON.stringify({ url, userId }) : null;

export const useGetLabStats = () => {
  const lab = useLabStore();
  const { isUser, user } = useAuth();
  const userId = isUser ? user.id : undefined;

  const { data: stats, isValidating: isValidatingStats } = useSWR(
    getKey(API.LAB.STATS, userId),
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
    getKey(API.LAB.UPDATES, userId),
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

  // Without a key SWR still hands back the fallback, i.e. what the store kept
  // from the previous session.
  const heroes = useMemo(
    () => (isUser && stats?.heroes) || [],
    [isUser, stats],
  );
  const tags = useMemo(() => (isUser && stats?.tags) || [], [isUser, stats]);
  const updates = useMemo(
    () => (isUser && updatesData) || [],
    [isUser, updatesData],
  );

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
