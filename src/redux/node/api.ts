import { api, cleanResult } from '~/utils/api';
import { IComment, INode } from '../types';
import { API } from '~/constants/api';
import { COMMENTS_DISPLAY } from './constants';
import {
  ApiGetNodeRelatedRequest,
  ApiGetNodeRelatedResult,
  ApiGetNodeRequest,
  ApiGetNodeResult,
  ApiLockCommentRequest,
  ApiLockcommentResult,
  ApiLockNodeRequest,
  ApiLockNodeResult,
  ApiPostCommentRequest,
  ApiPostCommentResult,
  ApiPostNodeHeroicRequest,
  ApiPostNodeHeroicResponse,
  ApiPostNodeLikeRequest,
  ApiPostNodeLikeResult,
  ApiPostNodeTagsRequest,
  ApiPostNodeTagsResult,
  GetNodeDiffRequest,
  GetNodeDiffResult,
} from '~/redux/node/types';
import axios, { AxiosRequestConfig } from 'axios';

export type ApiPostNodeRequest = { node: INode };
export type ApiPostNodeResult = {
  node: INode;
  errors: Record<string, string>;
};

export type ApiGetNodeCommentsRequest = {
  id: number;
  take?: number;
  skip?: number;
};
export type ApiGetNodeCommentsResponse = { comments: IComment[]; comment_count: number };

export const apiPostNode = ({ node }: ApiPostNodeRequest) =>
  api.post<ApiPostNodeResult>(API.NODE.SAVE, node).then(cleanResult);

export const apiPostNodeLocal = ({ node }: ApiPostNodeRequest) =>
  api.post<ApiPostNodeResult>(API.NODE.SAVE, node).then(cleanResult);

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

export const apiGetNode = ({ id }: ApiGetNodeRequest, config?: AxiosRequestConfig) =>
  api.get<ApiGetNodeResult>(API.NODE.GET_NODE(id), config).then(cleanResult);

export const apiGetNodeWithCancel = ({ id }: ApiGetNodeRequest) => {
  const cancelToken = axios.CancelToken.source();
  return {
    request: api
      .get<ApiGetNodeResult>(API.NODE.GET_NODE(id), {
        cancelToken: cancelToken.token,
      })
      .then(cleanResult),
    cancel: cancelToken.cancel,
  };
};

export const apiPostComment = ({ id, data }: ApiPostCommentRequest) =>
  api.post<ApiPostCommentResult>(API.NODE.COMMENT(id), data).then(cleanResult);

export const apiGetNodeComments = ({
  id,
  take = COMMENTS_DISPLAY,
  skip = 0,
}: ApiGetNodeCommentsRequest) =>
  api
    .get<ApiGetNodeCommentsResponse>(API.NODE.COMMENT(id), { params: { take, skip } })
    .then(cleanResult);

export const apiGetNodeRelated = ({ id }: ApiGetNodeRelatedRequest) =>
  api.get<ApiGetNodeRelatedResult>(API.NODE.RELATED(id)).then(cleanResult);

export const apiPostNodeTags = ({ id, tags }: ApiPostNodeTagsRequest) =>
  api
    .post<ApiPostNodeTagsResult>(API.NODE.UPDATE_TAGS(id), { tags })
    .then(cleanResult);

export const apiPostNodeLike = ({ id }: ApiPostNodeLikeRequest) =>
  api.post<ApiPostNodeLikeResult>(API.NODE.POST_LIKE(id)).then(cleanResult);

export const apiPostNodeHeroic = ({ id }: ApiPostNodeHeroicRequest) =>
  api.post<ApiPostNodeHeroicResponse>(API.NODE.POST_HEROIC(id)).then(cleanResult);

export const apiLockNode = ({ id, is_locked }: ApiLockNodeRequest) =>
  api
    .post<ApiLockNodeResult>(API.NODE.POST_LOCK(id), { is_locked })
    .then(cleanResult);

export const apiLockComment = ({ id, is_locked, current }: ApiLockCommentRequest) =>
  api
    .post<ApiLockcommentResult>(API.NODE.LOCK_COMMENT(current, id), { is_locked })
    .then(cleanResult);
