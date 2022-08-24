import { useCallback, useMemo } from 'react';

import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';

import { apiGetNodeComments } from '~/api/node';
import { API } from '~/constants/api';
import { COMMENTS_DISPLAY } from '~/constants/node';
import { IComment } from '~/types';
import { flatten, isNil } from '~/utils/ramda';

const getKey: (nodeId: number) => SWRInfiniteKeyLoader =
  (nodeId: number) => (pageIndex, previousPageData: IComment[]) => {
    if (pageIndex > 0 && !previousPageData?.length) return null;
    return `${API.NODES.COMMENT(nodeId)}?page=${pageIndex}`;
  };

const extractKey = (key: string) => {
  const re = new RegExp(`${API.NODES.COMMENT('\\d+')}\\?page=(\\d+)`);
  const match = key.match(re);

  if (!match || !Array.isArray(match) || isNil(match[1])) {
    return 0;
  }

  return parseInt(match[1], 10) || 0;
};

export const useGetComments = (nodeId: number, fallbackData?: IComment[]) => {
  const { data, isValidating, setSize, size, mutate } = useSWRInfinite(
    getKey(nodeId),
    async (key: string) => {
      const result = await apiGetNodeComments({
        id: nodeId,
        take: COMMENTS_DISPLAY,
        skip: extractKey(key) * COMMENTS_DISPLAY,
      });

      return result.comments;
    },
    {
      fallbackData: fallbackData && [fallbackData],
    },
  );

  const comments = useMemo(() => flatten(data || []), [data]);
  const hasMore =
    (data?.[size - 1]?.length || 0) >= COMMENTS_DISPLAY ||
    (!!data?.length && data?.length > 0 && isValidating);

  const onLoadMoreComments = useCallback(
    () => setSize(size + 1),
    [setSize, size],
  );

  return {
    comments,
    hasMore,
    onLoadMoreComments,
    isLoading: !data && isValidating,
    mutate,
    data,
    isLoadingMore: !!data?.length && isValidating,
  };
};
