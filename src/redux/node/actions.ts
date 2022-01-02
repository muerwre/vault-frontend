import { IFile } from '../types';
import { NODE_ACTIONS } from './constants';

export const nodeSetCoverImage = (current_cover_image?: IFile) => ({
  type: NODE_ACTIONS.SET_COVER_IMAGE,
  current_cover_image,
});
