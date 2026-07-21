import { useCallback } from 'react';

import useSWR from 'swr';

import { apiGetNodeRelated } from '~/api/node';
import { API } from '~/constants/api';
import { INode } from '~/types';
import { ApiGetNodeRelatedResult } from '~/types/node';

export const useGetNodeRelated = (id?: INode['id']) => {
  const { data, isValidating, mutate } = useSWR<ApiGetNodeRelatedResult>(
    API.NODES.RELATED(id),
    () => apiGetNodeRelated({ id }),
  );

  const refresh = useCallback(() => mutate(data, true), [data, mutate]);

  return { related: data?.related, isLoading: isValidating && !data, refresh };
};
