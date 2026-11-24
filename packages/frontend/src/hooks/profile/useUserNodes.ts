import { useCallback, useMemo } from 'react';

import useSWRInfinite from 'swr/infinite';

import { apiGetUserNodes } from '~/api/auth';
import { postProfileCellView } from '~/api/flow';
import { API } from '~/constants/api';
import { useAuth } from '~/hooks/auth/useAuth';
import { FlowDisplay, INode } from '~/types';
import { ILabNode } from '~/types/lab';
import { showErrorToast } from '~/utils/errors/showToast';
import { flatten } from '~/utils/ramda';

const PAGE_SIZE = 30;

type Key = [url: string, after: string, isUser: boolean, search: string];

/**
 * Pinned nodes ride along with the first page without counting against its
 * size, so paging looks only at the rest.
 */
const unpinned = (page?: ILabNode[]) =>
  (page || []).filter((item) => !item.node.is_pinned);

/**
 * A user's nodes, a page at a time: the ones pinned to the profile first, then
 * the rest, newest first. Each page continues from the oldest unpinned node of
 * the previous one. Lab nodes come along for signed-in viewers, so the
 * viewer's state is part of the key.
 *
 * Items are whole nodes with their comment counts, so the profile draws flow
 * cells (`nodes`) or lab cards (`items`) from the same listing.
 */
export const useUserNodes = (
  username?: string,
  enabled = true,
  /** Keeps nodes whose title or description contains it. */
  search = '',
) => {
  const { isUser } = useAuth();

  const getKey = useCallback(
    (index: number, previous: ILabNode[] | null): Key | null => {
      if (!username || !enabled) return null;
      if (index === 0) return [API.USER.NODES(username), '', isUser, search];

      const rest = unpinned(previous || []);
      if (rest.length < PAGE_SIZE) return null;

      return [
        API.USER.NODES(username),
        rest[rest.length - 1].node.created_at || '',
        isUser,
        search,
      ];
    },
    [username, enabled, isUser, search],
  );

  const { data, isValidating, setSize, size, mutate } = useSWRInfinite(
    getKey,
    async (_: string, after: string, __: boolean, query: string) => {
      const result = await apiGetUserNodes({
        username: username!,
        after: after || undefined,
        limit: PAGE_SIZE,
        search: query || undefined,
      });

      return result.nodes;
    },
    { revalidateFirstPage: false },
  );

  const items = useMemo(() => flatten(data || []), [data]);
  const nodes = useMemo(() => items.map((item) => item.node), [items]);
  const hasMore = unpinned(data?.[data.length - 1]).length >= PAGE_SIZE;
  const isLoading = isValidating && (!data || data.length < size);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    setSize(size + 1);
  }, [hasMore, isLoading, setSize, size]);

  const patchNode = useCallback(
    (id: INode['id'], patch: Partial<INode>) =>
      mutate(
        (pages) =>
          pages?.map((page) =>
            page.map((item) =>
              item.node.id === id
                ? { ...item, node: { ...item.node, ...patch } }
                : item,
            ),
          ),
        false,
      ),
    [mutate],
  );

  /** Changes the cell on the profile only; the flow keeps its own. */
  const onChangeCellView = useCallback(
    async (id: INode['id'], flow: FlowDisplay) => {
      await patchNode(id, { flow, has_profile_flow: true });

      try {
        await postProfileCellView({
          id,
          flow: {
            display: flow.display,
            show_description: flow.show_description,
          },
        });
      } catch (error) {
        showErrorToast(error);
        await mutate();
      }
    },
    [mutate, patchNode],
  );

  /** Drops the profile's own cell, so it looks as it does in the flow. */
  const onResetCellView = useCallback(
    async (id: INode['id']) => {
      try {
        const result = await postProfileCellView({ id, flow: null });
        await patchNode(id, result);
      } catch (error) {
        showErrorToast(error);
      }
    },
    [patchNode],
  );

  return {
    items,
    nodes,
    /** The first page has arrived; until then the listing is not yet known. */
    isLoaded: !!data,
    hasMore,
    isLoading,
    loadMore,
    onChangeCellView,
    onResetCellView,
  };
};
