import { createContext, FC, useContext } from 'react';

import { observer } from 'mobx-react-lite';

import { EMPTY_USER } from '~/constants/auth';
import { useAuth } from '~/hooks/auth/useAuth';
import { useMessageEventReactions } from '~/hooks/auth/useMessageEventReactions';
import { useRestorePasswordRedirect } from '~/hooks/auth/useRestorePasswordRedirect';

interface AuthProviderContextType extends ReturnType<typeof useAuth> {}

const AuthContext = createContext<AuthProviderContextType>({
  user: EMPTY_USER,
  isUser: false,
  isTester: false,
  setIsTester: isTester => isTester,
  logout: () => {},
  login: async () => EMPTY_USER,
  setToken: () => {},
});

export const AuthProvider: FC = observer(({ children }) => {
  const value = useAuth();

  useMessageEventReactions();
  useRestorePasswordRedirect();

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
});

export const useAuthProvider = () => useContext(AuthContext);
