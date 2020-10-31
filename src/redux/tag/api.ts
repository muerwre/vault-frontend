import { INode, IResultWithStatus } from '~/redux/types';
import { api, configWithToken, errorMiddleware, resultMiddleware } from '~/utils/api';
import { API } from '~/constants/api';

export const getTagNodes = ({
  access,
  tag,
  offset,
  limit,
}: {
  access: string;
  tag: string;
  offset: number;
  limit: number;
}): Promise<IResultWithStatus<{ nodes: INode[]; count: number }>> =>
  api
    .get(API.TAG.NODES, configWithToken(access, { params: { name: tag, offset, limit } }))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const getTagAutocomplete = ({
  search,
  exclude,
  access,
}: {
  access: string;
  search: string;
  exclude: string[];
}): Promise<IResultWithStatus<{ tags: string[] }>> =>
  api
    .get(API.TAG.AUTOCOMPLETE, configWithToken(access, { params: { search, exclude } }))
    .then(resultMiddleware)
    .catch(errorMiddleware);
