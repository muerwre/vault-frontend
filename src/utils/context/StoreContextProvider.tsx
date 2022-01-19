import React, { createContext, FC, useContext } from 'react';

import { observer } from 'mobx-react-lite';

import { Store } from '~/store';

export const StoreContext = createContext<Store>(new Store());

export const StoreContextProvider: FC<{ store: Store }> = observer(({ children, store }) => {
  if (!store.isHydrated) return null;

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
});

export const useStore = () => useContext(StoreContext);
