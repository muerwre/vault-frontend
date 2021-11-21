import { INode } from '~/redux/types';
import useSWR from 'swr';
import { AxiosResponse } from 'axios';
import { ApiGetNodeResponse } from '~/redux/node/types';
import { API } from '~/constants/api';
import { api } from '~/utils/api';

export const useGetNode = (id?: INode['id']) => {
  const { data, isValidating: isLoading } = useSWR<AxiosResponse<ApiGetNodeResponse>>(
    API.NODE.GET_NODE(id || ''),
    api.get
  );

  if (!id) {
    return { node: undefined, isLoading: false };
  }

  return { node: data?.data.node, isLoading };
};
