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
    isLoading: isLoadingSettings,
    update,
    refresh,
    settings,
  } = useNotificationSettingsRequest();

  const enabled = !isLoadingSettings && !settingsError && settingsEnabled;

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

  return {
    enabled,
    hasNew,
    indicatorEnabled,
    available: isUser,
    settings,
    markAsRead,
    refresh,
    update,
  };
};
