import { useCallback } from 'react';

import { isAfter, isBefore, isEqual, isValid, parse, parseISO } from 'date-fns';

import { useAuth } from '../auth/useAuth';

import { useNotificationSettingsRequest } from './useNotificationSettingsRequest';

export const useNotificationSettings = () => {
  // TODO: remove isTester
  const { isUser, isTester } = useAuth();

  const {
    error: settingsError,
    enabled: settingsEnabled,
    lastSeen,
    lastDate,
    isLoading: isLoadingSettings,
    update,
  } = useNotificationSettingsRequest();

  const enabled =
    !isLoadingSettings && !settingsError && settingsEnabled && isTester;

  const hasNew =
    enabled && !!lastDate && (!lastSeen || isAfter(lastDate, lastSeen));

  // TODO: store `indicator` as option and include it here
  const indicatorEnabled = enabled && true;

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
    indicatorEnabled,
    available: isUser,
    markAsRead,
  };
};
