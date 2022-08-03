import { useCallback, useMemo, useState } from "react";

import useSWRInfinite from "swr/infinite";
import { SWRInfiniteKeyLoader } from "swr/infinite";

import { apiGetNotes, apiPostNote } from "~/api/notes";
import { ApiGetNotesRequest } from "~/api/notes/types";
import { useAuth } from "~/hooks/auth/useAuth";
import { GetLabNodesRequest, ILabNode } from "~/types/lab";
import { Note } from "~/types/notes";
import { showErrorToast } from "~/utils/errors/showToast";
import { flatten, uniqBy } from "~/utils/ramda";

const DEFAULT_COUNT = 20;

const getKey: (isUser: boolean, search: string) => SWRInfiniteKeyLoader = (
  isUser,
  search,
) => (index, prev: ILabNode[]) => {
  if (!isUser) return null;
  if (index > 0 && (!prev?.length || prev.length < 20)) return null;

  const props: GetLabNodesRequest = {
    limit: DEFAULT_COUNT,
    offset: index * DEFAULT_COUNT,
    search: search || "",
  };

  return JSON.stringify(props);
};

const parseKey = (key: string): ApiGetNotesRequest => {
  try {
    return JSON.parse(key);
  } catch (error) {
    return { limit: DEFAULT_COUNT, offset: 0, search: "" };
  }
};

export const useNotes = (search: string) => {
  const { isUser } = useAuth();

  const { data, isValidating, size, setSize, mutate } = useSWRInfinite(
    getKey(isUser, search),
    async (key: string) => {
      const result = await apiGetNotes(parseKey(key));
      return result.list;
    },
    {
      dedupingInterval: 300,
    },
  );

  const submit = useCallback(
    async (text: string, onSuccess: (note: Note) => void) => {
      const result = await apiPostNote({ text });

      if (data) {
        mutate(data?.map((it, index) => (index === 0 ? [result, ...it] : it)));
      }

      onSuccess(result);
    },
    [],
  );

  const notes = useMemo(() => uniqBy(n => n.id, flatten(data || [])), [data]);
  const hasMore = (data?.[size - 1]?.length || 0) >= 1;
  const loadMore = useCallback(() => setSize(size + 1), [setSize, size]);

  return useMemo(
    () => ({
      notes,
      hasMore,
      loadMore,
      isLoading: !data && isValidating,
      submit,
    }),
    [notes, hasMore, loadMore, data, isValidating, submit],
  );
};
