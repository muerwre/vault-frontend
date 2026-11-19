import { useCallback } from 'react';

import { apiUserLogin } from '~/api/auth';
import { getRandomPhrase } from '~/constants/phrases';
import { useNavigation } from '~/hooks/navigation/useNavigation';
import { useAuthStore } from '~/store/auth/useAuthStore';
import { showToastInfo } from '~/utils/toast';

export const useLoginLogoutRestore = () => {
  const auth = useAuthStore();
  const { replace } = useNavigation();

  const logout = useCallback(() => {
    replace('/').then(() => {
      auth.logout();
      showToastInfo(getRandomPhrase('GOODBYE'));
    });
  }, [auth, replace]);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await apiUserLogin({ username, password });
      auth.setToken(result.token);
      showToastInfo(getRandomPhrase('WELCOME'));
      return result.user;
    },
    [auth],
  );

  return { logout, login };
};
