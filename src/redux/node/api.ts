import { api, configWithToken, resultMiddleware, errorMiddleware } from '~/utils/api';
import { INode, IResultWithStatus, IComment } from '../types';
import { API } from '~/constants/api';
import { nodeUpdateTags } from './actions';

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

export const postNodeComment = ({
  id,
  data,
  access,
}: {
  access: string;
  id: number;
  data: IComment;
}): Promise<IResultWithStatus<{ comment: Comment }>> =>
  api
    .post(API.NODE.COMMENT(id), data, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const getNodeComments = ({
  id,
  access,
}: {
  id: number;
  access: string;
}): Promise<IResultWithStatus<{ comment: Comment }>> =>
  api
    .get(API.NODE.COMMENT(id), configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const updateNodeTags = ({
  id,
  tags,
  access,
}: ReturnType<typeof nodeUpdateTags> & { access: string }): Promise<
  IResultWithStatus<{ node: INode }>
> =>
  api
    .post(API.NODE.UPDATE_TAGS(id), { tags }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);
