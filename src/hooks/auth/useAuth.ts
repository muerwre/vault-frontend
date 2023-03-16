import { useLoginLogoutRestore } from '~/hooks/auth/useLoginLogoutRestore';
import { useUser } from '~/hooks/auth/useUser';
import { useAuthStore } from '~/store/auth/useAuthStore';

export const useAuth = () => {
  const { user } = useUser();
  const auth = useAuthStore();

  const { login, logout } = useLoginLogoutRestore();

  return {
    user,
    logout,
    login,
    isUser: auth.isUser,
    setToken: auth.setToken,
    isTester: auth.isTester,
    setIsTester: auth.setIsTester,
    fetched: auth.fetched,
  };
};
