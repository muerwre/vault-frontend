import React, { createContext, FC, useContext } from 'react';
import { IUser } from '~/redux/auth/types';
import { EMPTY_USER } from '~/redux/auth/constants';

const UserContext = createContext<IUser>(EMPTY_USER);

export const UserProvider: FC<{ user: IUser }> = ({ children, user }) => (
  <UserContext.Provider value={user}>{children}</UserContext.Provider>
);

export const useUserContext = () => useContext(UserContext);
