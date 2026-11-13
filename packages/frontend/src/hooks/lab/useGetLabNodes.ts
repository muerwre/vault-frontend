import { useCallback, useMemo } from 'react';

import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';

import { getLabNodes } from '~/api/lab';
import { useAuth } from '~/hooks/auth/useAuth';
import { useDebouncedValue } from '~/hooks/data/useDebouncedValue';
import { useLabStore } from '~/store/lab/useLabStore';
import { INode } from '~/types';
import { GetLabNodesRequest, ILabNode, LabNodesSort } from '~/types/lab';
import { flatten, uniqBy } from '~/utils/ramda';

const getKey: (
  isUser: boolean,
  sort?: LabNodesSort,
  search?: string,
) => SWRInfiniteKeyLoader =
  (isUser, sort, search) => (index, prev: ILabNode[]) => {
    if (!isUser) return null;
    if (index > 0 && (!prev?.length || prev.length < 20)) return null;

    const props: GetLabNodesRequest = {
      limit: 20,
      offset: index * 20,
      sort: sort || LabNodesSort.New,
      search: search || '',
    };

    return JSON.stringify(props);
  };

const parseKey = (key: string): GetLabNodesRequest => {
  try {
    return JSON.parse(key);
  } catch (error) {
    return {};
  }
};

export const useGetLabNodes = (sort?: LabNodesSort, search?: string) => {
  const labStore = useLabStore();
  const { isUser } = useAuth();
  const searchDebounced = useDebouncedValue(search);

  const { data, isValidating, size, setSize, mutate } = useSWRInfinite(
    getKey(isUser, sort, searchDebounced),
    async (key: string) => {
      const result = await getLabNodes(parseKey(key));
      return result.nodes;
    },
    {
      fallbackData: [labStore.nodes],
      onSuccess: (data) => labStore.setNodes(flatten(data)),
      dedupingInterval: 300,
    },
  );

  const nodes = useMemo(
    () => uniqBy((n) => n.node.id, flatten(data || [])),
    [data],
  );
  const hasMore = (data?.[size - 1]?.length || 0) >= 1;
  const loadMore = useCallback(() => setSize(size + 1), [setSize, size]);

  /** prepends list with a node */
  const unshift = useCallback(
    async (node: ILabNode) => {
      await mutate([[node], ...(data || [])]);
    },
    [data, mutate],
  );

  /** updates node on cache */
  const updateNode = useCallback(
    async (nodeId: number, node: Partial<INode>) => {
      await mutate(
        data?.map((page) =>
          page.map((it) =>
            it.node.id === nodeId ? { ...it, node: { ...it.node, node } } : it,
          ),
        ),
      );
    },
    [data, mutate],
  );

  return {
    nodes,
    isLoading: !!data?.length && isValidating,
    hasMore,
    loadMore,
    unshift,
    updateNode,
  };
};
