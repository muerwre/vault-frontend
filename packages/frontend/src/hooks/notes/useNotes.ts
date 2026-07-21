import { useCallback, useMemo } from 'react';

import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';

import {
  apiCreateNote,
  apiDeleteNote,
  apiListNotes,
  apiUpdateNote,
} from '~/api/notes';
import { ApiGetNotesRequest } from '~/api/notes/types';
import { useAuth } from '~/hooks/auth/useAuth';
import { GetLabNodesRequest, ILabNode } from '~/types/lab';
import { Note } from '~/types/notes';
import { flatten, uniqBy } from '~/utils/ramda';

const DEFAULT_COUNT = 20;

const getKey: (isUser: boolean, search: string) => SWRInfiniteKeyLoader =
  (isUser, search) => (index, prev: ILabNode[]) => {
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

export const useNotes = (search: string) => {
  const { isUser } = useAuth();

  const { data, isValidating, size, setSize, mutate } = useSWRInfinite(
    getKey(isUser, search),
    async (key: string) => {
      const result = await apiListNotes(parseKey(key));
      return result.list;
    },
    {
      dedupingInterval: 300,
    },
  );

  const create = useCallback(
    async (text: string, onSuccess?: (note: Note) => void) => {
      const result = await apiCreateNote({ text });

      if (data) {
        await mutate(
          data?.map((it, index) => (index === 0 ? [result, ...it] : it)),
          { revalidate: false },
        );
      }

      onSuccess?.(result);
    },
    [mutate, data],
  );

  const remove = useCallback(
    async (id: number, onSuccess?: () => void) => {
      await apiDeleteNote(id);
      await mutate(
        data?.map((page) => page.filter((it) => it.id !== id)),
        { revalidate: false },
      );
      onSuccess?.();
    },
    [mutate, data],
  );

  const update = useCallback(
    async (id: number, text: string, onSuccess?: () => void) => {
      const result = await apiUpdateNote({ id, text });
      await mutate(
        data?.map((page) => page.map((it) => (it.id === id ? result : it))),
        { revalidate: false },
      );
      onSuccess?.();
    },
    [mutate, data],
  );

  const notes = useMemo(() => uniqBy((n) => n.id, flatten(data || [])), [data]);
  const hasMore = (data?.[size - 1]?.length || 0) >= 1;
  const loadMore = useCallback(() => setSize(size + 1), [setSize, size]);

  return useMemo(
    () => ({
      notes,
      hasMore,
      loadMore,
      isLoading: !data && isValidating,
      create,
      remove,
      update,
    }),
    [notes, hasMore, loadMore, data, isValidating, create, remove, update],
  );
};
