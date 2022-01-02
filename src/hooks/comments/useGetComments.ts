import { KeyLoader } from 'swr';
import { IComment } from '~/redux/types';
import { API } from '~/constants/api';
import { flatten, isNil } from 'ramda';
import useSWRInfinite from 'swr/infinite';
import { apiGetNodeComments } from '~/redux/node/api';
import { COMMENTS_DISPLAY } from '~/redux/node/constants';
import { useCallback } from 'react';

const getKey: (nodeId: number) => KeyLoader<IComment[]> = (nodeId: number) => (
  pageIndex,
  previousPageData
) => {
  if (pageIndex > 0 && !previousPageData?.length) return null;
  return `${API.NODE.COMMENT(nodeId)}?page=${pageIndex}`;
};

const extractKey = (key: string) => {
  const re = new RegExp(`${API.NODE.COMMENT('\\d+')}\\?page=(\\d+)`);
  const match = key.match(re);

  if (!match || !Array.isArray(match) || isNil(match[1])) {
    return 0;
  }

  return parseInt(match[1], 10) || 0;
};

export const useGetComments = (nodeId: number) => {
  // TODO: const postedCommentsLength = Math.min(0, data[data.length - 1] - COMMENTS_DISPLAY);

  const { data, isValidating, setSize, size, mutate } = useSWRInfinite(
    getKey(nodeId),
    async (key: string) => {
      const result = await apiGetNodeComments({
        id: nodeId,
        take: COMMENTS_DISPLAY,
        skip: extractKey(key) * COMMENTS_DISPLAY, // TODO: - postedCommentsLength,
      });

      return result.comments;
    }
  );

  const comments = flatten(data || []);
  const hasMore =
    !!data?.[data?.length - 1].length && data[data.length - 1].length === COMMENTS_DISPLAY;

  const onLoadMoreComments = useCallback(() => setSize(size + 1), [setSize, size]);

  return { comments, hasMore, onLoadMoreComments, isLoading: !data && isValidating, mutate, data };
};