import useSWR from 'swr';

import { apiGetFeatures } from '~/api/registration';
import { API } from '~/constants/api';

const NONE = { registration: false, registration_approval: false };

/**
 * What the backend currently allows. Cached by SWR, so the header, the login
 * dialog and the registration form share one request. Fetched only while
 * `enabled`.
 */
export const useFeatures = (enabled = true) => {
  const { data, error } = useSWR(
    enabled ? API.FEATURES : null,
    apiGetFeatures,
    { revalidateOnFocus: false },
  );

  return {
    features: data ?? NONE,
    isLoading: enabled && !data && !error,
  };
};
