import { useCallback } from 'react';

import useSWR from 'swr';

import { apiGetNode } from '~/api/node';
import { API } from '~/constants/api';
import { EMPTY_NODE } from '~/constants/node';
import { useUser } from '~/hooks/auth/useUser';
import { useOnNodeSeen } from '~/hooks/node/useOnNodeSeen';
import { INode } from '~/types';
import { ApiGetNodeResponse } from '~/types/node';

const getKey = (nodeId: number, userId = 0) =>
  JSON.stringify({
    url: API.NODES.GET(nodeId),
    userId,
  });

export const useLoadNode = (id: number, fallbackData?: ApiGetNodeResponse) => {
  const { user } = useUser();
  const { data, isValidating, mutate } = useSWR<ApiGetNodeResponse>(
    getKey(id, user.id),
    () => apiGetNode({ id }),
    { fallbackData, revalidateOnMount: true },
  );

  const update = useCallback(
    async (node?: Partial<INode>) => {
      if (!data?.node) {
        await mutate();
        return;
      }

      await mutate({ node: { ...data.node, ...node } }, true);
    },
    [data, mutate],
  );

  useOnNodeSeen(data?.node);

  return {
    node: data?.node || EMPTY_NODE,
    isLoading: isValidating && !data,
    update,
    lastSeen: data?.last_seen,
  };
};
