import { ITagState } from '~/redux/tag/index';
import { TAG_ACTIONS } from '~/redux/tag/constants';

export const tagSetNodes = (nodes: Partial<ITagState['nodes']>) => ({
  type: TAG_ACTIONS.SET_TAG_NODES,
  nodes,
});

export const tagLoadNodes = (tag: string) => ({
  type: TAG_ACTIONS.LOAD_TAG_NODES,
  tag,
});
