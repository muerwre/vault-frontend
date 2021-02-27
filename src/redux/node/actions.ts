import { IComment, IFile, INode, ITag, IValidationErrors } from '../types';
import { NODE_ACTIONS } from './constants';
import { INodeState } from './reducer';

export const nodeSet = (node: Partial<INodeState>) => ({
  node,
  type: NODE_ACTIONS.SET,
});

export const nodeSave = (node: INode) => ({
  node,
  type: NODE_ACTIONS.SAVE,
});

export const nodeSetSaveErrors = (errors: IValidationErrors) => ({
  errors,
  type: NODE_ACTIONS.SET_SAVE_ERRORS,
});

export const nodeGotoNode = (id: number, node_type: INode['type']) => ({
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
  type: NODE_ACTIONS.POST_COMMENT,
});

export const nodeCancelCommentEdit = (id: number) => ({
  id,
  type: NODE_ACTIONS.CANCEL_COMMENT_EDIT,
});

export const nodeSetSendingComment = (is_sending_comment: boolean) => ({
  is_sending_comment,
  type: NODE_ACTIONS.SET_SENDING_COMMENT,
});

export const nodeSetComments = (comments: IComment[]) => ({
  comments,
  type: NODE_ACTIONS.SET_COMMENTS,
});

export const nodeSetRelated = (related: INodeState['related']) => ({
  related,
  type: NODE_ACTIONS.SET_RELATED,
});

export const nodeSetCommentData = (id: number, comment: Partial<IComment>) => ({
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
  type: NODE_ACTIONS.EDIT,
  id,
});

export const nodeLike = (id: INode['id']) => ({
  type: NODE_ACTIONS.LIKE,
  id,
});

export const nodeStar = (id: INode['id']) => ({
  type: NODE_ACTIONS.STAR,
  id,
});

export const nodeLock = (id: INode['id'], is_locked: boolean) => ({
  type: NODE_ACTIONS.LOCK,
  id,
  is_locked,
});

export const nodeLockComment = (id: IComment['id'], is_locked: boolean) => ({
  type: NODE_ACTIONS.LOCK_COMMENT,
  id,
  is_locked,
});

export const nodeEditComment = (id: IComment['id']) => ({
  type: NODE_ACTIONS.EDIT_COMMENT,
  id,
});

export const nodeSetEditor = (editor: INode) => ({
  type: NODE_ACTIONS.SET_EDITOR,
  editor,
});

export const nodeSetCoverImage = (current_cover_image: IFile) => ({
  type: NODE_ACTIONS.SET_COVER_IMAGE,
  current_cover_image,
});

export const nodeLoadMoreComments = () => ({
  type: NODE_ACTIONS.LOAD_MORE_COMMENTS,
});
