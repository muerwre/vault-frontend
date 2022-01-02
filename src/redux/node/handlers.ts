import { assocPath } from 'ramda';
import { NODE_ACTIONS } from './constants';
import { nodeSetCoverImage } from './actions';
import { INodeState } from './reducer';

const setCoverImage = (
  state: INodeState,
  { current_cover_image }: ReturnType<typeof nodeSetCoverImage>
) => assocPath(['current_cover_image'], current_cover_image, state);

export const NODE_HANDLERS = {
  [NODE_ACTIONS.SET_COVER_IMAGE]: setCoverImage,
};
