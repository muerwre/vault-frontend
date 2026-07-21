import { createContext, FC, useContext } from 'react';

import { observer } from 'mobx-react-lite';

import { EMPTY_USER } from '~/constants/auth';
import { useUser } from '~/hooks/auth/useUser';
import { IUser } from '~/types/auth';

const UserContext = createContext<IUser>(EMPTY_USER);

export const UserContextProvider: FC = observer(({ children }) => {
  const { user } = useUser();

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
});

export const useUserContext = () => useContext(UserContext);
