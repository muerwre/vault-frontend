import { api, configWithToken, resultMiddleware, errorMiddleware } from '~/utils/api';
import { INode, IResultWithStatus } from '../types';
import { API } from '~/constants/api';

export const postNode = ({
  access,
  node,
}: {
  access: string;
  node: INode;
}): Promise<IResultWithStatus<INode>> =>
  api
    .post(API.NODE.SAVE, { node }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const getNodes = ({
  skip = 0,
}: {
  skip?: number;
}): Promise<IResultWithStatus<{ nodes: INode[] }>> =>
  api
    .get(API.NODE.GET, { params: { skip } })
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const getNode = ({
  id,
}: {
  id: string | number;
}): Promise<IResultWithStatus<{ nodes: INode[] }>> =>
  api
    .get(API.NODE.GET_NODE(id))
    .then(resultMiddleware)
    .catch(errorMiddleware);
