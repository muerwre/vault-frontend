import { useCallback } from 'react';

import useSWR from 'swr';

import { apiAuthGetUser } from '~/api/auth';
import { API } from '~/constants/api';
import { EMPTY_USER } from '~/constants/auth';
import { useAuthStore } from '~/store/auth/useAuthStore';
import { IUser } from '~/types/auth';
import { showErrorToast } from '~/utils/errors/showToast';

export const useUser = () => {
  const { token, setUser } = useAuthStore();
  const { data, mutate } = useSWR(token ? API.USER.ME : null, () => apiAuthGetUser(), {
    onSuccess: data => setUser(data?.user || EMPTY_USER),
    onError: error => showErrorToast(error),
  });

  const update = useCallback(
    async (user: Partial<IUser>, revalidate?: boolean) => {
      if (!data?.user) {
        console.warn('mutating user before loaded it :-(');
        return;
      }

      await mutate({ ...data, user: { ...data.user, ...user } }, revalidate);
    },
    [data, mutate]
  );

  return { user: data?.user || EMPTY_USER, update };
};
