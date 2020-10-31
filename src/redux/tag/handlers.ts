import { TAG_ACTIONS } from '~/redux/tag/constants';
import { ITagState } from '~/redux/tag/index';
import { tagSetNodes } from '~/redux/tag/actions';

const setNodes = (state: ITagState, { nodes }: ReturnType<typeof tagSetNodes>) => ({
  ...state,
  nodes: {
    ...state.nodes,
    ...nodes,
  },
});

export const TAG_HANDLERS = {
  [TAG_ACTIONS.SET_TAG_NODES]: setNodes,
};
