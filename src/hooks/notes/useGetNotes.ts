import { useCallback, useMemo } from 'react';

import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';

import { getLabNodes } from '~/api/lab';
import { apiGetNotes } from '~/api/notes';
import { ApiGetNotesRequest } from '~/api/notes/types';
import { useAuth } from '~/hooks/auth/useAuth';
import { useUser } from '~/hooks/auth/useUser';
import { GetLabNodesRequest, ILabNode, LabNodesSort } from '~/types/lab';
import { flatten, uniqBy } from '~/utils/ramda';

const DEFAULT_COUNT = 20;

const getKey: (isUser: boolean, search: string) => SWRInfiniteKeyLoader = (isUser, search) => (
  index,
  prev: ILabNode[]
) => {
  if (!isUser) return null;
  if (index > 0 && (!prev?.length || prev.length < 20)) return null;

  const props: GetLabNodesRequest = {
    limit: DEFAULT_COUNT,
    offset: index * DEFAULT_COUNT,
    search: search || '',
  };

  return JSON.stringify(props);
};

const parseKey = (key: string): ApiGetNotesRequest => {
  try {
    return JSON.parse(key);
  } catch (error) {
    return { limit: DEFAULT_COUNT, offset: 0, search: '' };
  }
};

export const useGetNotes = (search: string) => {
  const { isUser } = useAuth();

  const { data, isValidating, size, setSize, mutate } = useSWRInfinite(
    getKey(isUser, search),
    async (key: string) => {
      const result = await apiGetNotes(parseKey(key));
      return result.list;
    },
    {
      dedupingInterval: 300,
    }
  );

  const notes = useMemo(() => uniqBy(n => n.id, flatten(data || [])), [data]);
  const hasMore = (data?.[size - 1]?.length || 0) >= 1;
  const loadMore = useCallback(() => setSize(size + 1), [setSize, size]);

  return { notes, hasMore, loadMore, isLoading: !data && isValidating };
};
