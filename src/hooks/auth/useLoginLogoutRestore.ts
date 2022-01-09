import { useAuthStore } from '~/store/auth/useAuthStore';
import { useCallback } from 'react';
import { apiUserLogin } from '~/api/auth';

export const useLoginLogoutRestore = () => {
  const auth = useAuthStore();

  const logout = useCallback(() => auth.logout(), [auth]);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await apiUserLogin({ username, password });
      auth.setToken(result.token);
      return result.user;
    },
    [auth]
  );

  return { logout, login };
};
