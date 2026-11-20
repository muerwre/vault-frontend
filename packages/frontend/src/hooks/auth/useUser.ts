import { useCallback, useEffect } from 'react';

import useSWR from 'swr';

import { apiAuthGetUser } from '~/api/auth';
import { API } from '~/constants/api';
import { EMPTY_USER } from '~/constants/auth';
import { useAuthStore } from '~/store/auth/useAuthStore';
import { IUser } from '~/types/auth';
import { showErrorToast } from '~/utils/errors/showToast';

/** Answers already stored, so the copies of the hook store each one once. */
const stored = new WeakSet<object>();

export const useUser = () => {
  const { token, setUser, setFetched, user } = useAuthStore();

  // Stands in until the user is fetched, so a fresh answer is told from it.
  const fallbackData = { user };

  const { data, mutate } = useSWR(
    token ? API.USER.ME : null,
    () => apiAuthGetUser(),
    {
      onError: (error) => showErrorToast(error),
      fallbackData,
    },
  );

  /*
   * Stores the fetched user from every copy of this hook, rather than from
   * SWR's `onSuccess`: that runs only in the copy that started the request,
   * and not at all if it has unmounted meanwhile, as a page swapping its
   * layout does. Every mounted copy is handed the answer; the header always
   * holds one.
   */
  const isFetched = !!data && data !== fallbackData;

  useEffect(() => {
    if (!isFetched || stored.has(data)) {
      return;
    }

    stored.add(data);
    setUser(data?.user || EMPTY_USER);
    setFetched(true);
    // the answer itself, not each render's stand-in, is what changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched ? data : null]);

  const update = useCallback(
    async (user: Partial<IUser>, revalidate?: boolean) => {
      if (!data?.user) {
        console.warn('mutating user before loaded it :-(');
        return;
      }

      await mutate({ ...data, user: { ...data.user, ...user } }, revalidate);
    },
    [data, mutate],
  );

  return { user: data?.user || EMPTY_USER, update };
};
