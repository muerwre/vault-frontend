import useSWR from 'swr';

import { apiGetFeatures } from '~/api/registration';
import { API } from '~/constants/api';

const NONE = { registration: false, registration_approval: false };

/**
 * What the backend currently allows. Only fetched where it matters (`enabled`),
 * since the build-time flag already decides whether entry points render.
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
