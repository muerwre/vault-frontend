import useSWR from 'swr';

import { apiAuthGetUpdates } from '~/api/auth';
import { API } from '~/constants/api';
import { useAuth } from '~/hooks/auth/useAuth';

export const useUpdates = () => {
  const { isUser } = useAuth();
  const { data } = useSWR(
    isUser ? API.USER.GET_UPDATES : null,
    () => apiAuthGetUpdates({ exclude_dialogs: 0, last: '' }),
    { refreshInterval: 5 * 60 * 1000 },
  );

  const borisCommentedAt = data?.boris?.commented_at || '';
  /** Registration requests awaiting an admin; always 0 for everyone else. */
  const pendingRegistrations = data?.registrations?.pending ?? 0;

  return { borisCommentedAt, pendingRegistrations };
};
