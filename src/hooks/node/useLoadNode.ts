import { useCallback } from 'react';

import useSWR from 'swr';

import { apiGetNode } from '~/api/node';
import { API } from '~/constants/api';
import { EMPTY_NODE } from '~/constants/node';
import { useOnNodeSeen } from '~/hooks/node/useOnNodeSeen';
import { INode } from '~/types';
import { ApiGetNodeResponse } from '~/types/node';

export const useLoadNode = (id: number, fallbackData?: ApiGetNodeResponse) => {
  const { data, isValidating, mutate } = useSWR<ApiGetNodeResponse>(
    API.NODE.GET_NODE(id),
    () => apiGetNode({ id }),
    { fallbackData, revalidateOnMount: true }
  );

  const update = useCallback(
    async (node?: Partial<INode>) => {
      if (!data?.node) {
        await mutate();
        return;
      }

      await mutate({ node: { ...data.node, ...node } }, true);
    },
    [data, mutate]
  );

  useOnNodeSeen(data?.node);

  return {
    node: data?.node || EMPTY_NODE,
    isLoading: isValidating && !data,
    update,
    lastSeen: data?.last_seen,
  };
};
