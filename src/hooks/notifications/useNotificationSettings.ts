import { useCallback } from 'react';

import { isAfter, isEqual } from 'date-fns';

import { useAuth } from '../auth/useAuth';

import { useNotificationSettingsRequest } from './useNotificationSettingsRequest';

export const useNotificationSettings = () => {
  const { isUser } = useAuth();

  const {
    error: settingsError,
    enabled: settingsEnabled,
    lastSeen,
    lastDate,
    isLoading,
    update,
    refresh,
    settings,
  } = useNotificationSettingsRequest();

  const enabled = !isLoading && !settingsError && settingsEnabled;

  const hasNew =
    enabled && !!lastDate && (!lastSeen || isAfter(lastDate, lastSeen));

  const indicatorEnabled = enabled && !!settings?.showIndicator;

  const markAsRead = useCallback(() => {
    if (
      !lastDate ||
      (lastSeen && (isEqual(lastSeen, lastDate) || isAfter(lastSeen, lastDate)))
    ) {
      return;
    }

    update({ lastSeen: lastDate.toISOString() });
  }, [update, lastDate, lastSeen]);

  const toggleEnabled = useCallback(
    () => update({ enabled: !settings?.enabled }),
    [update, settings],
  );

  return {
    enabled,
    hasNew,
    indicatorEnabled,
    available: isUser,
    settings,
    markAsRead,
    refresh,
    update,
    loading: isLoading,
    toggleEnabled,
    lastSeen,
    lastDate,
  };
};
