import { isAfter, isValid, parse, parseISO } from 'date-fns';

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
  } = useNotificationSettingsRequest();

  const enabled = !isLoadingSettings && !settingsError && settingsEnabled;

  const hasNew =
    enabled && !!lastDate && (!lastSeen || isAfter(lastDate, lastSeen));

  return {
    enabled,
    hasNew,
    available: isUser,
  };
};
