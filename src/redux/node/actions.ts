import { IComment, IFile, INode, ITag, IValidationErrors } from '../types';
import { NODE_ACTIONS } from './constants';
import { INodeState } from './reducer';

export const nodeSet = (node: Partial<INodeState>) => ({
  node,
  type: NODE_ACTIONS.SET,
});

export const nodeGotoNode = (id: INode['id'], node_type: INode['type']) => ({
  id,
  node_type,
  type: NODE_ACTIONS.GOTO_NODE,
});

export const nodeLoadNode = (id: number, order?: 'ASC' | 'DESC') => ({
  id,
  order,
  type: NODE_ACTIONS.LOAD_NODE,
});

export const nodeSetLoading = (is_loading: INodeState['is_loading']) => ({
  is_loading,
  type: NODE_ACTIONS.SET_LOADING,
});

export const nodeSetLoadingComments = (is_loading_comments: INodeState['is_loading_comments']) => ({
  is_loading_comments,
  type: NODE_ACTIONS.SET_LOADING_COMMENTS,
});

export const nodeSetCurrent = (current: INodeState['current']) => ({
  current,
  type: NODE_ACTIONS.SET_CURRENT,
});

export const nodePostLocalComment = (
  nodeId: INode['id'],
  comment: IComment,
  callback: (e?: string) => void
) => ({
  nodeId,
  comment,
  callback,
  type: NODE_ACTIONS.POST_LOCAL_COMMENT,
});

export const nodeSetSendingComment = (is_sending_comment: boolean) => ({
  is_sending_comment,
  type: NODE_ACTIONS.SET_SENDING_COMMENT,
});

export const nodeSetComments = (comments: IComment[]) => ({
  comments,
  type: NODE_ACTIONS.SET_COMMENTS,
});

export const nodeLockComment = (id: number, is_locked: boolean, nodeId: number) => ({
  type: NODE_ACTIONS.LOCK_COMMENT,
  nodeId,
  id,
  is_locked,
});

export const nodeSetCoverImage = (current_cover_image?: IFile) => ({
  type: NODE_ACTIONS.SET_COVER_IMAGE,
  current_cover_image,
});

export const nodeLoadMoreComments = () => ({
  type: NODE_ACTIONS.LOAD_MORE_COMMENTS,
});
