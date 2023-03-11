import { useCallback } from 'react';

import { isAfter, isBefore, isEqual, isValid, parse, parseISO } from 'date-fns';

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
  } = useNotificationSettingsRequest();

  const enabled = !isLoadingSettings && !settingsError && settingsEnabled;

  const hasNew =
    enabled && !!lastDate && (!lastSeen || isAfter(lastDate, lastSeen));

  const markAsRead = useCallback(() => {
    if (
      !lastDate ||
      (lastSeen && (isEqual(lastSeen, lastDate) || isAfter(lastSeen, lastDate)))
    ) {
      return;
    }

    update({ last_seen: lastDate.toISOString() });
  }, [update, lastDate, lastSeen]);

  return {
    enabled,
    hasNew,
    available: isUser,
    markAsRead,
  };
};
