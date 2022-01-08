import useSWR from 'swr';
import { API } from '~/constants/api';
import { apiAuthGetUserProfile } from '~/redux/auth/api';
import { EMPTY_USER } from '~/redux/auth/constants';
import { useCallback } from 'react';
import { IUser } from '~/redux/auth/types';

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
