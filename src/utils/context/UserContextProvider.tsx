import React, { createContext, FC, useContext } from 'react';
import { IUser } from '~/types/auth';
import { EMPTY_USER } from '~/constants/auth';
import { useUser } from '~/hooks/auth/useUser';
import { observer } from 'mobx-react-lite';

const UserContext = createContext<IUser>(EMPTY_USER);

export const UserContextProvider: FC = observer(({ children }) => {
  const { user } = useUser();

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
});

export const useUserContext = () => useContext(UserContext);
