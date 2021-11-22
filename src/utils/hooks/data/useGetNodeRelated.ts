import { INode } from '~/redux/types';
import useSWR from 'swr';
import { AxiosResponse } from 'axios';
import { ApiGetNodeRelatedResult } from '~/redux/node/types';
import { API } from '~/constants/api';
import { api } from '~/utils/api';
import { useCallback } from 'react';

export const useGetNodeRelated = (id?: INode['id']) => {
  const { data, isValidating: isLoading, mutate } = useSWR<AxiosResponse<ApiGetNodeRelatedResult>>(
    API.NODE.RELATED(id),
    api.get
  );

  const refresh = useCallback(() => mutate(data, true), [data, mutate]);

  return { related: data?.data.related, isLoading, refresh };
};
