import { useCallback, useEffect } from 'react';
import isBefore from 'date-fns/isBefore';
import { IComment } from '~/types';
import { useRandomPhrase } from '~/constants/phrases';
import { useBorisStats } from '~/hooks/boris/useBorisStats';
import { useLastSeenBoris } from '~/hooks/auth/useLastSeenBoris';
import { useAuth } from '~/hooks/auth/useAuth';

export const useBoris = (comments: IComment[]) => {
  const title = useRandomPhrase('BORIS_TITLE');

  const { lastSeen, setLastSeen } = useLastSeenBoris();
  const { isTester, setIsTester } = useAuth();

  useEffect(() => {
    const last_comment = comments[0];

    if (!last_comment) return;

    if (
      !last_comment.created_at ||
      !lastSeen ||
      isBefore(new Date(lastSeen), new Date(last_comment.created_at))
    ) {
      return;
    }

    void setLastSeen(last_comment.created_at);
  }, [lastSeen, setLastSeen, comments]);

  const { stats, isLoading: isLoadingStats } = useBorisStats();

  const setIsBetaTester = useCallback(
    (isTester: boolean) => {
      setIsTester(isTester);
    },
    [setIsTester]
  );

  return { setIsBetaTester, isTester, stats, title, isLoadingStats };
};
