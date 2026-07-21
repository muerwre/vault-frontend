import { useMemo } from 'react';

import useSWR from 'swr';

import { apiGetUserMessages } from '~/api/messages';
import { API } from '~/constants/api';
import { IMessage } from '~/types';

const getKey = (username: string): string | null => {
  return username ? `${API.USER.MESSAGES}/${username}` : null;
};
export const useMessages = (username: string) => {
  const { data, isValidating } = useSWR(getKey(username), async () =>
    apiGetUserMessages({ username }),
  );

  const messages: IMessage[] = useMemo(() => data?.messages || [], [data]);

  return { messages, isLoading: !data && isValidating };
};
