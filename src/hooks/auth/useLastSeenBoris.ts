import { useCallback } from 'react';

import { useUser } from '~/hooks/auth/useUser';

export const useLastSeenBoris = () => {
  const { user, update } = useUser();
  const lastSeen = user.last_seen_boris;

  const setLastSeen = useCallback(
    async (date: string) => {
      await update({ last_seen_boris: date }, false);
    },
    [update]
  );

  return { setLastSeen, lastSeen };
};
