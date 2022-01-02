import { assocPath } from 'ramda';
import { NODE_ACTIONS } from './constants';
import {
  nodeSet,
  nodeSetComments,
  nodeSetCoverImage,
  nodeSetLoading,
  nodeSetLoadingComments,
  nodeSetSendingComment,
} from './actions';
import { INodeState } from './reducer';

const setData = (state: INodeState, { node }: ReturnType<typeof nodeSet>) => ({
  ...state,
  ...node,
});

const setLoading = (state: INodeState, { is_loading }: ReturnType<typeof nodeSetLoading>) =>
  assocPath(['is_loading'], is_loading, state);

const setLoadingComments = (
  state: INodeState,
  { is_loading_comments }: ReturnType<typeof nodeSetLoadingComments>
) => assocPath(['is_loading_comments'], is_loading_comments, state);

const setSendingComment = (
  state: INodeState,
  { is_sending_comment }: ReturnType<typeof nodeSetSendingComment>
) => assocPath(['is_sending_comment'], is_sending_comment, state);

const setComments = (state: INodeState, { comments }: ReturnType<typeof nodeSetComments>) =>
  assocPath(['comments'], comments, state);

const setCoverImage = (
  state: INodeState,
  { current_cover_image }: ReturnType<typeof nodeSetCoverImage>
) => assocPath(['current_cover_image'], current_cover_image, state);

export const NODE_HANDLERS = {
  [NODE_ACTIONS.SET]: setData,
  [NODE_ACTIONS.SET_LOADING]: setLoading,
  [NODE_ACTIONS.SET_LOADING_COMMENTS]: setLoadingComments,
  [NODE_ACTIONS.SET_SENDING_COMMENT]: setSendingComment,
  [NODE_ACTIONS.SET_COMMENTS]: setComments,
  [NODE_ACTIONS.SET_COVER_IMAGE]: setCoverImage,
};
