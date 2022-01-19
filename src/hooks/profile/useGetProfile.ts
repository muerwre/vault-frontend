import { useCallback } from 'react';

import useSWR from 'swr';

import { apiAuthGetUserProfile } from '~/api/auth';
import { API } from '~/constants/api';
import { EMPTY_USER } from '~/constants/auth';
import { IUser } from '~/types/auth';

const getKey = (username?: string): string | null => {
  return username ? `${API.USER.PROFILE}/${username}` : null;
};

export const useGetProfile = (username?: string) => {
  const { data, isValidating, mutate } = useSWR(
    getKey(username),
    async () => {
      const result = await apiAuthGetUserProfile({ username: username || '' });
      return result.user;
    },
    {
      refreshInterval: 60000,
    }
  );

  const profile = data || EMPTY_USER;

  const update = useCallback(
    async (user: Partial<IUser>) => {
      await mutate({ ...profile, ...user });
    },
    [mutate, profile]
  );

  return { profile, isLoading: !data && isValidating, update };
};
