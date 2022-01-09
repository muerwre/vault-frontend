import { useUser } from '~/hooks/auth/useUser';
import { useAuthStore } from '~/store/auth/useAuthStore';
import { useLoginLogoutRestore } from '~/hooks/auth/useLoginLogoutRestore';

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
  };
};
