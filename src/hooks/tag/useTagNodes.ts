import { useCallback, useMemo } from 'react';

import { flatten, isNil } from 'ramda';
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';

import { apiGetNodesOfTag } from '~/api/tags';
import { API } from '~/constants/api';
import { INode } from '~/types';

const PAGE_SIZE = 10;

const getKey: (tag: string) => SWRInfiniteKeyLoader = tag => (
  pageIndex,
  previousPageData: INode[]
) => {
  if (pageIndex > 0 && !previousPageData?.length) return null;
  return `${API.TAG.NODES}?tag=${tag}&page=${pageIndex}`;
};

const extractKey = (key: string) => {
  const re = new RegExp(`${API.TAG.NODES}\\?tag=[^&]+&page=(\\d+)`);
  const match = key.match(re);

  if (!match || !Array.isArray(match) || isNil(match[1])) {
    return 0;
  }

  return parseInt(match[1], 10) || 0;
};

export const useTagNodes = (tag: string) => {
  const { data, isValidating, setSize, size, mutate } = useSWRInfinite(
    getKey(tag),
    async (key: string) => {
      const result = await apiGetNodesOfTag({
        tag,
        limit: PAGE_SIZE,
        offset: extractKey(key) * PAGE_SIZE,
      });

      return result.nodes;
    }
  );

  const nodes = useMemo(() => flatten(data || []), [data]);
  const hasMore = (data?.[size - 1]?.length || 0) >= PAGE_SIZE;

  const loadMore = useCallback(() => setSize(size + 1), [setSize, size]);

  return { nodes, hasMore, loadMore, isLoading: !data && isValidating, mutate, data };
};
