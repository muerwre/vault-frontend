import { INode } from '~/redux/types';
import useSWR from 'swr';
import { ApiGetNodeRelatedResult } from '~/types/node';
import { API } from '~/constants/api';
import { useCallback } from 'react';
import { apiGetNodeRelated } from '~/api/node';

export const useGetNodeRelated = (id?: INode['id']) => {
  const { data, isValidating, mutate } = useSWR<ApiGetNodeRelatedResult>(API.NODE.RELATED(id), () =>
    apiGetNodeRelated({ id })
  );

  const refresh = useCallback(() => mutate(data, true), [data, mutate]);

  return { related: data?.related, isLoading: isValidating && !data, refresh };
};
