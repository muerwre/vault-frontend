import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';
import { GetLabNodesRequest, ILabNode } from '~/types/lab';
import { getLabNodes } from '~/api/lab';
import { flatten, last, uniqBy } from 'ramda';
import { useLabStore } from '~/store/lab/useLabStore';
import { useCallback, useEffect } from 'react';
import { INode } from '~/redux/types';
import { useUser } from '~/hooks/user/userUser';

const getKey: (isUser: boolean) => SWRInfiniteKeyLoader = isUser => (index, prev: ILabNode[]) => {
  if (!isUser) return null;
  if (index > 0 && !prev?.length) return null;

  const lastNode = last(prev || []);
  if (!lastNode && index > 0) {
    return null;
  }

  const props: GetLabNodesRequest = {
    after: lastNode?.node.commented_at || lastNode?.node.created_at,
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

export const useGetLabNodes = () => {
  const labStore = useLabStore();
  const { is_user } = useUser();

  const { data, isValidating, size, setSize, mutate } = useSWRInfinite(
    getKey(is_user),
    async (key: string) => {
      const result = await getLabNodes(parseKey(key));
      return result.nodes;
    },
    {
      fallbackData: [labStore.nodes],
      onSuccess: data => labStore.setNodes(flatten(data)),
    }
  );

  const nodes = uniqBy(n => n.node.id, flatten(data || []));
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

  /** purge cache on exit */
  useEffect(() => {
    if (is_user) {
      return;
    }

    labStore.setNodes([]);
  }, [is_user, labStore]);

  return { nodes, isLoading: !data && isValidating, hasMore, loadMore, unshift, updateNode };
};
