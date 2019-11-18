import {
  api,
  configWithToken,
  resultMiddleware,
  errorMiddleware
} from "~/utils/api";
import { INode, IResultWithStatus, IComment } from "../types";
import { API } from "~/constants/api";
import { nodeUpdateTags, nodeLike, nodeStar } from "./actions";
import { INodeState } from "./reducer";

export const postNode = ({
  access,
  node
}: {
  access: string;
  node: INode;
}): Promise<IResultWithStatus<INode>> =>
  api
    .post(API.NODE.SAVE, { node }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);
// .then(console.log);

export const getNodes = ({
  from = null,
  access
}: {
  from?: string;
  access: string;
}): Promise<IResultWithStatus<{ nodes: INode[] }>> =>
  api
    .get(API.NODE.GET, configWithToken(access, { params: { from } }))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const getNodeDiff = ({
  start = null,
  end = null,
  take,
  with_heroes,
  with_updated,
  with_recent,
  with_valid,
  access
}: {
  start?: string;
  end?: string;
  take?: number;
  access: string;
  with_heroes: boolean;
  with_updated: boolean;
  with_recent: boolean;
  with_valid: boolean;
}): Promise<IResultWithStatus<{ nodes: INode[] }>> =>
  api
    .get(
      API.NODE.GET_DIFF,
      configWithToken(access, {
        params: {
          start,
          end,
          take,
          with_heroes,
          with_updated,
          with_recent,
          with_valid
        }
      })
    )
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const getNode = ({
  id,
  access
}: {
  id: string | number;
  access: string;
}): Promise<IResultWithStatus<{ nodes: INode[] }>> =>
  api
    .get(API.NODE.GET_NODE(id), configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const postNodeComment = ({
  id,
  data,
  access
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
  order = "ASC"
}: {
  id: number;
  access: string;
  order: "ASC" | "DESC";
}): Promise<IResultWithStatus<{ comments: Comment[] }>> =>
  api
    .get(API.NODE.COMMENT(id), configWithToken(access, { params: { order } }))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const getNodeRelated = ({
  id,
  access
}: {
  id: number;
  access: string;
}): Promise<IResultWithStatus<{ related: INodeState["related"] }>> =>
  api
    .get(API.NODE.RELATED(id), configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const updateNodeTags = ({
  id,
  tags,
  access
}: ReturnType<typeof nodeUpdateTags> & { access: string }): Promise<
  IResultWithStatus<{ node: INode }>
> =>
  api
    .post(API.NODE.UPDATE_TAGS(id), { tags }, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const postNodeLike = ({
  id,
  access
}: ReturnType<typeof nodeLike> & { access: string }): Promise<
  IResultWithStatus<{ is_liked: INode["is_liked"] }>
> =>
  api
    .post(API.NODE.POST_LIKE(id), {}, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);

export const postNodeStar = ({
  id,
  access
}: ReturnType<typeof nodeStar> & { access: string }): Promise<
  IResultWithStatus<{ is_liked: INode["is_liked"] }>
> =>
  api
    .post(API.NODE.POST_STAR(id), {}, configWithToken(access))
    .then(resultMiddleware)
    .catch(errorMiddleware);
