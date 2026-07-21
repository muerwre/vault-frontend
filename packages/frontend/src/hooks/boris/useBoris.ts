import { useEffect } from 'react';

import isBefore from 'date-fns/isBefore';

import { useRandomPhrase } from '~/constants/phrases';
import { useLastSeenBoris } from '~/hooks/auth/useLastSeenBoris';
import { useBorisStats } from '~/hooks/boris/useBorisStats';
import { IComment } from '~/types';

export const useBoris = (comments: IComment[]) => {
  const title = useRandomPhrase('BORIS_TITLE');

  const { lastSeen, setLastSeen } = useLastSeenBoris();

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

  return { stats, title, isLoadingStats };
};
