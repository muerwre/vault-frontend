import { INode, IValidationErrors, IComment } from '../types';
import { NODE_ACTIONS } from './constants';
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

export const nodePostComment = (data: IComment, id: INode['id']) => ({
  data,
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
