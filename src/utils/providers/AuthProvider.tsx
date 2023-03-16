import { createContext, FC, useContext } from 'react';

import { observer } from 'mobx-react-lite';
import { boolean } from 'yup';

import { EMPTY_USER } from '~/constants/auth';
import { useAuth } from '~/hooks/auth/useAuth';
import { useOauthEventListeners } from '~/hooks/auth/useOauthEventListeners';
import { useRestorePasswordRedirect } from '~/hooks/auth/useRestorePasswordRedirect';
import { useSessionCookie } from '~/hooks/auth/useSessionCookie';

interface AuthProviderContextType extends ReturnType<typeof useAuth> {}

const AuthContext = createContext<AuthProviderContextType>({
  user: EMPTY_USER,
  isUser: false,
  isTester: false,
  setIsTester: (isTester) => isTester,
  logout: () => {},
  login: async () => EMPTY_USER,
  setToken: () => {},
  fetched: false,
});

export const AuthProvider: FC = observer(({ children }) => {
  const value = useAuth();

  useOauthEventListeners();
  useRestorePasswordRedirect();
  useSessionCookie();

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
});

export const useAuthProvider = () => useContext(AuthContext);
