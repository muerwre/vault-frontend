import { TAG_ACTIONS } from '~/redux/tag/constants';
import { ITagState } from '~/redux/tag/index';
import { tagSetAutocomplete, tagSetNodes } from '~/redux/tag/actions';

const setNodes = (state: ITagState, { nodes }: ReturnType<typeof tagSetNodes>) => ({
  ...state,
  nodes: {
    ...state.nodes,
    ...nodes,
  },
});

const setAutocomplete = (
  state: ITagState,
  { autocomplete }: ReturnType<typeof tagSetAutocomplete>
) => ({
  ...state,
  autocomplete: {
    ...state.autocomplete,
    ...autocomplete,
  },
});

export const TAG_HANDLERS = {
  [TAG_ACTIONS.SET_TAG_NODES]: setNodes,
  [TAG_ACTIONS.SET_TAG_AUTOCOMPLETE]: setAutocomplete,
};
