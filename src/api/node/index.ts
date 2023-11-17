import axios, { AxiosRequestConfig, CancelToken } from 'axios';

import { API } from '~/constants/api';
import { COMMENTS_DISPLAY } from '~/constants/node';
import { IComment, INode } from '~/types';
import {
  ApiDeleteNodeTagsRequest,
  ApiDeleteNodeTagsResult,
  ApiGetNodeRelatedRequest,
  ApiGetNodeRelatedResult,
  ApiGetNodeRequest,
  ApiGetNodeResponse,
  ApiLikeCommentRequest,
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
} from '~/types/node';
import { api, unwrap } from '~/utils/api';

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
export type ApiGetNodeCommentsResponse = {
  comments: IComment[];
  comment_count: number;
};

export const apiPostNode = ({ node }: ApiPostNodeRequest) =>
  api.post<ApiPostNodeResult>(API.NODES.SAVE, node).then(unwrap);

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
    .get<GetNodeDiffResult>(API.NODES.LIST, {
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
    .then(unwrap);

export const apiGetNode = (
  { id }: ApiGetNodeRequest,
  config?: AxiosRequestConfig,
) =>
  api
    .get<ApiGetNodeResponse>(API.NODES.GET(id), config)
    .then(unwrap)
    .then((data) => ({
      node: data.node,
      last_seen: data.last_seen,
      backlinks: data.backlinks,
    }));

export const apiGetNodeWithCancel = ({ id }: ApiGetNodeRequest) => {
  const cancelToken = axios.CancelToken.source();
  return {
    request: api
      .get<ApiGetNodeResponse>(API.NODES.GET(id), {
        cancelToken: cancelToken.token,
      })
      .then(unwrap),
    cancel: cancelToken.cancel,
  };
};

export const apiPostComment = ({ id, data }: ApiPostCommentRequest) =>
  api.post<ApiPostCommentResult>(API.NODES.COMMENT(id), data).then(unwrap);

export const apiLikeComment = (
  nodeId: number,
  commentId: number,
  data: ApiLikeCommentRequest,
  options?: { cancelToken?: CancelToken },
) =>
  api
    .post<ApiPostCommentResult>(
      API.NODES.COMMENT_LIKES(nodeId, commentId),
      data,
      { cancelToken: options?.cancelToken },
    )
    .then(unwrap);

export const apiGetNodeComments = ({
  id,
  take = COMMENTS_DISPLAY,
  skip = 0,
}: ApiGetNodeCommentsRequest) =>
  api
    .get<ApiGetNodeCommentsResponse>(API.NODES.COMMENT(id), {
      params: { take, skip },
    })
    .then(unwrap);

export const apiGetNodeRelated = ({ id }: ApiGetNodeRelatedRequest) =>
  api.get<ApiGetNodeRelatedResult>(API.NODES.RELATED(id)).then(unwrap);

export const apiPostNodeTags = ({ id, tags }: ApiPostNodeTagsRequest) =>
  api
    .post<ApiPostNodeTagsResult>(API.NODES.UPDATE_TAGS(id), { tags })
    .then(unwrap);

export const apiDeleteNodeTag = ({ id, tagId }: ApiDeleteNodeTagsRequest) =>
  api
    .delete<ApiDeleteNodeTagsResult>(API.NODES.DELETE_TAG(id, tagId))
    .then(unwrap);

export const apiPostNodeLike = ({ id }: ApiPostNodeLikeRequest) =>
  api.post<ApiPostNodeLikeResult>(API.NODES.LIKE(id)).then(unwrap);

export const apiPostNodeHeroic = ({ id }: ApiPostNodeHeroicRequest) =>
  api.post<ApiPostNodeHeroicResponse>(API.NODES.HEROIC(id)).then(unwrap);

export const apiLockNode = ({ id, is_locked }: ApiLockNodeRequest) =>
  api
    .delete<ApiLockNodeResult>(API.NODES.DELETE(id), { params: { is_locked } })
    .then(unwrap);

export const apiLockComment = ({
  id,
  isLocked,
  nodeId,
}: ApiLockCommentRequest) =>
  api
    .delete<ApiLockcommentResult>(API.NODES.LOCK_COMMENT(nodeId, id), {
      params: {
        is_locked: isLocked,
      },
    })
    .then(unwrap);
