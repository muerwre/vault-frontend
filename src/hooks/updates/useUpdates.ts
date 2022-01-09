import useSWR from 'swr';
import { useAuth } from '~/hooks/auth/useAuth';
import { apiAuthGetUpdates } from '~/api/auth';
import { API } from '~/constants/api';

export const useUpdates = () => {
  const { isUser } = useAuth();
  const { data } = useSWR(
    isUser ? API.USER.GET_UPDATES : null,
    () => apiAuthGetUpdates({ exclude_dialogs: 0, last: '' }),
    { refreshInterval: 5 * 60 * 1000 }
  );

  const borisCommentedAt = data?.boris?.commented_at || '';

  return { borisCommentedAt };
};
