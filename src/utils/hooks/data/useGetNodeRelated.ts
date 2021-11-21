import { INode } from '~/redux/types';
import useSWR from 'swr';
import { AxiosResponse } from 'axios';
import { ApiGetNodeRelatedResult } from '~/redux/node/types';
import { API } from '~/constants/api';
import { api } from '~/utils/api';

export const useGetNodeRelated = (id?: INode['id']) => {
  const { data, isValidating: isLoading } = useSWR<AxiosResponse<ApiGetNodeRelatedResult>>(
    API.NODE.RELATED(id),
    api.get
  );

  return { related: data?.data.related, isLoading };
};
