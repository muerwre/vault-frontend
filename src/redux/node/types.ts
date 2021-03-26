import { IComment, INode } from '~/redux/types';
import { INodeState } from '~/redux/node/reducer';

export interface IEditorComponentProps {}

export type GetNodeDiffRequest = {
  start?: string;
  end?: string;
  take?: number;
  with_heroes: boolean;
  with_updated: boolean;
  with_recent: boolean;
  with_valid: boolean;
};

export type GetNodeDiffResult = {
  before?: INode[];
  after?: INode[];
  heroes?: INode[];
  recent?: INode[];
  updated?: INode[];
  valid: INode['id'][];
};

export type PostCellViewRequest = {
  id: INode['id'];
  flow: INode['flow'];
};
export type PostCellViewResult = unknown; // TODO: update it with actual type

export type ApiGetNodeRequest = {
  id: string | number;
};
export type ApiGetNodeResult = { node: INode };

export type ApiGetNodeRelatedRequest = {
  id: INode['id'];
};
export type ApiGetNodeRelatedResult = {
  related: INodeState['related'];
};

export type ApiPostCommentRequest = {
  id: INode['id'];
  data: IComment;
};
export type ApiPostCommentResult = {
  comment: IComment;
};

export type ApiPostNodeTagsRequest = {
  id: INode['id'];
  tags: string[];
};
export type ApiPostNodeTagsResult = {
  node: INode;
};

export type ApiPostNodeLikeRequest = { id: INode['id'] };
export type ApiPostNodeLikeResult = { is_liked: boolean };

export type ApiPostNodeHeroicRequest = { id: INode['id'] };
export type ApiPostNodeHeroicResponse = { is_heroic: boolean };

export type ApiLockNodeRequest = {
  id: INode['id'];
  is_locked: boolean;
};
export type ApiLockNodeResult = {
  deleted_at: string;
};

export type ApiLockCommentRequest = {
  id: IComment['id'];
  current: INode['id'];
  is_locked: boolean;
};
export type ApiLockcommentResult = {
  deleted_at: string;
};
export type NodeEditorProps = {};

export type INodeRelated = {
  albums: Record<string, INode[]>;
  similar: INode[];
};
