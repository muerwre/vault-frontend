import { INode, IValidationErrors, IComment, ITag } from '../types';
import { NODE_ACTIONS, NODE_TYPES } from './constants';
import { INodeState } from './reducer';

export const nodeSave = (node: INode) => ({
  node,
  type: NODE_ACTIONS.SAVE,
});

export const nodeSetSaveErrors = (errors: IValidationErrors) => ({
  errors,
  type: NODE_ACTIONS.SET_SAVE_ERRORS,
});

export const nodeLoadNode = (id: number, node_type: INode['type']) => ({
  id,
  node_type,
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

export const nodePostComment = (id: number) => ({
  id,
  type: NODE_ACTIONS.POST_COMMENT,
});

export const nodeSetSendingComment = (is_sending_comment: boolean) => ({
  is_sending_comment,
  type: NODE_ACTIONS.SET_SENDING_COMMENT,
});

export const nodeSetComments = (comments: IComment[]) => ({
  comments,
  type: NODE_ACTIONS.SET_COMMENTS,
});

export const nodeSetCommentData = (id: number, comment: IComment) => ({
  id,
  comment,
  type: NODE_ACTIONS.SET_COMMENT_DATA,
});

export const nodeUpdateTags = (id: INode['id'], tags: string[]) => ({
  type: NODE_ACTIONS.UPDATE_TAGS,
  id,
  tags,
});

export const nodeSetTags = (tags: ITag[]) => ({
  type: NODE_ACTIONS.SET_TAGS,
  tags,
});

export const nodeCreate = (node_type: INode['type']) => ({
  type: NODE_ACTIONS.CREATE,
  node_type,
});

export const nodeEdit = (id: INode['id']) => ({
  type: NODE_ACTIONS.CREATE,
  id,
});

export const nodeSetEditor = (editor: INode) => ({
  type: NODE_ACTIONS.SET_EDITOR,
  editor,
});
