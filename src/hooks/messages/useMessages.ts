import useSWR from 'swr';
import { API } from '~/constants/api';
import { apiGetUserMessages } from '~/api/messages';
import { IMessage } from '~/redux/types';

const getKey = (username: string): string | null => {
  return username ? `${API.USER.MESSAGES}/${username}` : null;
};
export const useMessages = (username: string) => {
  const { data, isValidating } = useSWR(getKey(username), async () =>
    apiGetUserMessages({ username })
  );

  const messages: IMessage[] = data?.messages || [];

  return { messages, isLoading: !data && isValidating };
};
