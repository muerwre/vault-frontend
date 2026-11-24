import { useCallback } from 'react';

import useSWR from 'swr';

import { apiAuthGetUserProfile } from '~/api/auth';
import { API } from '~/constants/api';
import { EMPTY_USER } from '~/constants/auth';
import { IUser } from '~/types/auth';

const getKey = (username?: string): string | null =>
  username ? API.USER.PROFILE(username) : null;

export const useGetProfile = (username?: string) => {
  const { data, isValidating, mutate, error } = useSWR(
    getKey(username),
    async () => {
      const result = await apiAuthGetUserProfile({ username: username || '' });
      return result.user;
    },
    {
      refreshInterval: 60000,
    },
  );

  const profile = data || EMPTY_USER;

  /** Patches the cached profile without refetching it. */
  const update = useCallback(
    async (user: Partial<IUser>) => {
      await mutate(
        (current) => ({ ...(current || EMPTY_USER), ...user }),
        false,
      );
    },
    [mutate],
  );

  return {
    profile,
    isLoading: !data && !error && isValidating,
    notFound: !!error && !data,
    update,
  };
};
