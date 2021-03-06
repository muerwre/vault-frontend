import { assocPath } from 'ramda';
import { NODE_ACTIONS } from './constants';
import {
  nodeSetSaveErrors,
  nodeSetLoading,
  nodeSetCurrent,
  nodeSetLoadingComments,
  nodeSetSendingComment,
  nodeSetComments,
  nodeSetCommentData,
  nodeSetTags,
  nodeSetEditor,
  nodeSetCoverImage,
  nodeSetRelated,
  nodeSet,
} from './actions';
import { INodeState } from './reducer';

const setData = (state: INodeState, { node }: ReturnType<typeof nodeSet>) => ({
  ...state,
  ...node,
});

const setSaveErrors = (state: INodeState, { errors }: ReturnType<typeof nodeSetSaveErrors>) =>
  assocPath(['errors'], errors, state);

const setLoading = (state: INodeState, { is_loading }: ReturnType<typeof nodeSetLoading>) =>
  assocPath(['is_loading'], is_loading, state);

const setLoadingComments = (
  state: INodeState,
  { is_loading_comments }: ReturnType<typeof nodeSetLoadingComments>
) => assocPath(['is_loading_comments'], is_loading_comments, state);

const setCurrent = (state: INodeState, { current }: ReturnType<typeof nodeSetCurrent>) =>
  assocPath(['current'], current, state);

const setSendingComment = (
  state: INodeState,
  { is_sending_comment }: ReturnType<typeof nodeSetSendingComment>
) => assocPath(['is_sending_comment'], is_sending_comment, state);

const setComments = (state: INodeState, { comments }: ReturnType<typeof nodeSetComments>) =>
  assocPath(['comments'], comments, state);

const setRelated = (state: INodeState, { related }: ReturnType<typeof nodeSetRelated>) =>
  assocPath(['related'], related, state);

const setCommentData = (
  state: INodeState,
  { id, comment }: ReturnType<typeof nodeSetCommentData>
) => ({
  ...state,
  comment_data: {
    ...state.comment_data,
    [id]: {
      ...(state.comment_data[id] || {}),
      ...comment,
    },
  },
})

const setTags = (state: INodeState, { tags }: ReturnType<typeof nodeSetTags>) =>
  assocPath(['current', 'tags'], tags, state);

const setEditor = (state: INodeState, { editor }: ReturnType<typeof nodeSetEditor>) =>
  assocPath(['editor'], editor, state);

const setCoverImage = (
  state: INodeState,
  { current_cover_image }: ReturnType<typeof nodeSetCoverImage>
) => assocPath(['current_cover_image'], current_cover_image, state);

export const NODE_HANDLERS = {
  [NODE_ACTIONS.SET]: setData,
  [NODE_ACTIONS.SET_SAVE_ERRORS]: setSaveErrors,
  [NODE_ACTIONS.SET_LOADING]: setLoading,
  [NODE_ACTIONS.SET_LOADING_COMMENTS]: setLoadingComments,
  [NODE_ACTIONS.SET_CURRENT]: setCurrent,
  [NODE_ACTIONS.SET_SENDING_COMMENT]: setSendingComment,
  [NODE_ACTIONS.SET_COMMENTS]: setComments,
  [NODE_ACTIONS.SET_RELATED]: setRelated,
  [NODE_ACTIONS.SET_COMMENT_DATA]: setCommentData,
  [NODE_ACTIONS.SET_TAGS]: setTags,
  [NODE_ACTIONS.SET_EDITOR]: setEditor,
  [NODE_ACTIONS.SET_COVER_IMAGE]: setCoverImage,
};
