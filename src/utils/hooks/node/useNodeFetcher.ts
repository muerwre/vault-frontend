import useSWR from 'swr';
import { INode } from '~/redux/types';
import { apiGetNode } from '~/redux/node/api';

export const useNodeFetcher = (id: INode['id']) => {
  const { data, error, isValidating } = useSWR(`${id}`, apiGetNode);
  const node = data?.node;
  const isLoading = !data && !isValidating;

  return { node, error, isLoading };
};
