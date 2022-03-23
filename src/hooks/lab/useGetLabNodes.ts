import { useCallback, useMemo } from 'react';

import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';

import { getLabNodes } from '~/api/lab';
import { useAuth } from '~/hooks/auth/useAuth';
import { useLabStore } from '~/store/lab/useLabStore';
import { INode } from '~/types';
import { GetLabNodesRequest, ILabNode, LabNodesSort } from '~/types/lab';
import { flatten, last, uniqBy } from '~/utils/ramda';

const getKey: (isUser: boolean, sort?: LabNodesSort) => SWRInfiniteKeyLoader = (isUser, sort) => (
  index,
  prev: ILabNode[]
) => {
  if (!isUser) return null;
  if (index > 0 && !prev?.length) return null;

  const lastNode = last(prev || []);
  if (!lastNode && index > 0) {
    return null;
  }

  const props: GetLabNodesRequest = {
    after: lastNode?.node.commented_at || lastNode?.node.created_at,
    sort: sort || LabNodesSort.New,
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

export const useGetLabNodes = (sort?: LabNodesSort) => {
  const labStore = useLabStore();
  const { isUser } = useAuth();

  const { data, isValidating, size, setSize, mutate } = useSWRInfinite(
    getKey(isUser, sort),
    async (key: string) => {
      const result = await getLabNodes(parseKey(key));
      return result.nodes;
    },
    {
      fallbackData: [labStore.nodes],
      onSuccess: data => labStore.setNodes(flatten(data)),
    }
  );

  const nodes = useMemo(() => uniqBy(n => n.node.id, flatten(data || [])), [data]);
  const hasMore = (data?.[size - 1]?.length || 0) >= 1;
  const loadMore = useCallback(() => setSize(size + 1), [setSize, size]);

  /** prepends list with a node */
  const unshift = useCallback(
    async (node: ILabNode) => {
      await mutate([[node], ...(data || [])]);
    },
    [data, mutate]
  );

  /** updates node on cache */
  const updateNode = useCallback(
    async (nodeId: number, node: Partial<INode>) => {
      await mutate(
        data?.map(page =>
          page.map(it => (it.node.id === nodeId ? { ...it, node: { ...it.node, node } } : it))
        )
      );
    },
    [data, mutate]
  );

  return { nodes, isLoading: !data && isValidating, hasMore, loadMore, unshift, updateNode };
};
