import { api, configWithToken, resultMiddleware, errorMiddleware, cleanResult } from '~/utils/api';
import { INode, IResultWithStatus, IComment } from '../types';
import { API } from '~/constants/api';
import { nodeUpdateTags, nodeLike, nodeStar, nodeLock, nodeLockComment } from './actions';
import { INodeState } from './reducer';
import { COMMENTS_DISPLAY } from './constants';
import { GetNodeDiffRequest, GetNodeDiffResult } from '~/redux/node/types';

export const postNode = ({
  access,
  node,
}: {
  access: string;
  node: INode;
}): Promise<IResultWithStatus<INode>> =>
  api
    .post(API.NODE.SAVE, node, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const getNodes = ({
  from,
  access,
}: {
  from?: string;
  access: string;
}): Promise<IResultWithStatus<{ nodes: INode[] }>> =>
  api
    .get(API.NODE.GET, configWithToken(access, { params: { from } }))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const getNodeDiff = ({
  start,
  end,
  take,
  with_heroes,
  with_updated,
  with_recent,
  with_valid,
}: GetNodeDiffRequest) =>
  api
    .get<GetNodeDiffResult>(API.NODE.GET_DIFF, {
      params: {
        start,
        end,
        take,
        with_heroes,
        with_updated,
        with_recent,
        with_valid,
      },
    })
    .then(cleanResult);

export const getNode = ({
  id,
  access,
}: {
  id: string | number;
  access: string;
}): Promise<IResultWithStatus<{ nodes: INode[] }>> =>
  api.get(API.NODE.GET_NODE(id), configWithToken(access)).then(cleanResult);

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
  take = COMMENTS_DISPLAY,
  skip = 0,
}: {
  id: number;
  access: string;
  take?: number;
  skip?: number;
}): Promise<IResultWithStatus<{ comments: IComment[]; comment_count: number }>> =>
  api
    .get(API.NODE.COMMENT(id), configWithToken(access, { params: { take, skip } }))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const getNodeRelated = ({
  id,
  access,
}: {
  id: number;
  access: string;
}): Promise<IResultWithStatus<{ related: INodeState['related'] }>> =>
  api
    .get(API.NODE.RELATED(id), configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const updateNodeTags = ({
  id,
  tags,
  access,
}: ReturnType<typeof nodeUpdateTags> & { access: string }): Promise<IResultWithStatus<{
  node: INode;
}>> =>
  api
    .post(API.NODE.UPDATE_TAGS(id), { tags }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const postNodeLike = ({
  id,
  access,
}: ReturnType<typeof nodeLike> & { access: string }): Promise<IResultWithStatus<{
  is_liked: INode['is_liked'];
}>> =>
  api
    .post(API.NODE.POST_LIKE(id), {}, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const postNodeStar = ({
  id,
  access,
}: ReturnType<typeof nodeStar> & { access: string }): Promise<IResultWithStatus<{
  is_liked: INode['is_liked'];
}>> =>
  api
    .post(API.NODE.POST_STAR(id), {}, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const postNodeLock = ({
  id,
  is_locked,
  access,
}: ReturnType<typeof nodeLock> & { access: string }): Promise<IResultWithStatus<{
  deleted_at: INode['deleted_at'];
}>> =>
  api
    .post(API.NODE.POST_LOCK(id), { is_locked }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const postNodeLockComment = ({
  id,
  is_locked,
  current,
  access,
}: ReturnType<typeof nodeLockComment> & {
  access: string;
  current: INode['id'];
}): Promise<IResultWithStatus<{ deleted_at: INode['deleted_at'] }>> =>
  api
    .post(API.NODE.POST_LOCK_COMMENT(current, id), { is_locked }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);
