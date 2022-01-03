import { KeyLoader } from 'swr';
import { INode } from '~/redux/types';
import { API } from '~/constants/api';
import { flatten, isNil } from 'ramda';
import useSWRInfinite from 'swr/infinite';
import { useCallback } from 'react';
import { apiGetNodesOfTag } from '~/api/tags';

const PAGE_SIZE = 10;

const getKey: (tag: string) => KeyLoader<INode[]> = tag => (pageIndex, previousPageData) => {
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

  const nodes = flatten(data || []);
  const hasMore = (data?.[size - 1]?.length || 0) >= PAGE_SIZE;

  const loadMore = useCallback(() => setSize(size + 1), [setSize, size]);

  return { nodes, hasMore, loadMore, isLoading: !data && isValidating, mutate, data };
};
