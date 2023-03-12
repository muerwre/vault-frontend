import { createContext, FC, useContext } from 'react';

import { observer } from 'mobx-react-lite';

import { useNotificationSettings } from '~/hooks/notifications/useNotificationSettings';

interface NotificationProviderProps {}

const defaultValue = {
  available: false,
  enabled: false,
  hasNew: false,
  indicatorEnabled: false,
  markAsRead: () => {},
};

const NotificationContext = createContext(defaultValue);

const NotificationProvider: FC<NotificationProviderProps> = observer(
  ({ children }) => {
    const value = useNotificationSettings();

    return (
      <NotificationContext.Provider value={value}>
        {children}
      </NotificationContext.Provider>
    );
  },
);

export const useNotifications = () => useContext(NotificationContext);

export { NotificationProvider };
