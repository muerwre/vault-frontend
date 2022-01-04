import React, { createContext, FC, useContext } from 'react';
import { Store } from '~/store';

export const StoreContext = createContext<Store>(new Store());

export const StoreContextProvider: FC<{ store: Store }> = ({ children, store }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
