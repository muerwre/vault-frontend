import { useCallback, useMemo } from 'react';

import useSWRInfinite from 'swr/infinite';

import { apiGetUserNodes } from '~/api/auth';
import { postCellView } from '~/api/flow';
import { API } from '~/constants/api';
import { useAuth } from '~/hooks/auth/useAuth';
import { FlowDisplay, IFlowNode, INode } from '~/types';
import { showErrorToast } from '~/utils/errors/showToast';
import { flatten } from '~/utils/ramda';

const PAGE_SIZE = 40;

type Key = [url: string, after: string, isUser: boolean];

/**
 * A user's nodes, newest first, a page at a time. Each page continues from the
 * oldest node of the previous one. Lab nodes come along for signed-in viewers,
 * so the viewer's state is part of the key.
 */
export const useUserNodes = (username?: string) => {
  const { isUser } = useAuth();

  const getKey = useCallback(
    (index: number, previous: IFlowNode[] | null): Key | null => {
      if (!username) return null;
      if (index === 0) return [API.USER.NODES(username), '', isUser];
      if (!previous || previous.length < PAGE_SIZE) return null;

      return [
        API.USER.NODES(username),
        previous[previous.length - 1].created_at || '',
        isUser,
      ];
    },
    [username, isUser],
  );

  const { data, isValidating, setSize, size, mutate } = useSWRInfinite(
    getKey,
    async (_: string, after: string) => {
      const result = await apiGetUserNodes({
        username: username!,
        after: after || undefined,
        limit: PAGE_SIZE,
      });

      return result.nodes;
    },
    { revalidateFirstPage: false },
  );

  const nodes = useMemo(() => flatten(data || []), [data]);
  const hasMore = (data?.[data.length - 1]?.length || 0) >= PAGE_SIZE;
  const isLoading = isValidating && (!data || data.length < size);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    setSize(size + 1);
  }, [hasMore, isLoading, setSize, size]);

  const onChangeCellView = useCallback(
    async (id: INode['id'], flow: FlowDisplay) => {
      await mutate(
        (pages) =>
          pages?.map((page) =>
            page.map((node) => (node.id === id ? { ...node, flow } : node)),
          ),
        false,
      );

      try {
        await postCellView({ id, flow });
      } catch (error) {
        showErrorToast(error);
        await mutate();
      }
    },
    [mutate],
  );

  return { nodes, hasMore, isLoading, loadMore, onChangeCellView };
};
