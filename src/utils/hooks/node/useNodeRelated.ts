import { INode } from '~/redux/types';
import useSWR from 'swr';
import { apiGetNodeRelated } from '~/redux/node/api';
import { API } from '~/constants/api';

export const useNodeRelated = (id?: INode['id']) => {
  const { data, error, isValidating } = useSWR(API.NODE.RELATED(id), apiGetNodeRelated);
  const isLoading = !data && !isValidating;
  const related = data?.related;

  return { related, error, isLoading };
};
