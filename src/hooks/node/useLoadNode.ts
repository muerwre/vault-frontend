import useSWR from 'swr';
import { ApiGetNodeResponse } from '~/types/node';
import { API } from '~/constants/api';
import { useOnNodeSeen } from '~/hooks/node/useOnNodeSeen';
import { apiGetNode } from '~/api/node';
import { useCallback } from 'react';
import { INode } from '~/redux/types';
import { EMPTY_NODE } from '~/constants/node';

export const useLoadNode = (id: number) => {
  const { data, isValidating, mutate } = useSWR<ApiGetNodeResponse>(API.NODE.GET_NODE(id), () =>
    apiGetNode({ id })
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
