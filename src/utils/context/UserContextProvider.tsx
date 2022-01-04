import React, { createContext, FC, useContext } from 'react';
import { IUser } from '~/redux/auth/types';
import { EMPTY_USER } from '~/redux/auth/constants';
import { useUser } from '~/hooks/user/userUser';

const UserContext = createContext<IUser>(EMPTY_USER);

export const UserContextProvider: FC = ({ children }) => {
  const user = useUser();

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
