import { ITagState } from '~/redux/tag/index';
import { TAG_ACTIONS } from '~/redux/tag/constants';

export const tagSetNodes = (nodes: Partial<ITagState['nodes']>) => ({
  type: TAG_ACTIONS.SET_TAG_NODES,
  nodes,
});

export const tagLoadNodes = (tag: string) => ({
  type: TAG_ACTIONS.LOAD_NODES,
  tag,
});

export const tagSetAutocomplete = (autocomplete: Partial<ITagState['autocomplete']>) => ({
  type: TAG_ACTIONS.SET_TAG_AUTOCOMPLETE,
  autocomplete,
});

export const tagLoadAutocomplete = (search: string, exclude: string[]) => ({
  type: TAG_ACTIONS.LOAD_AUTOCOMPLETE,
  search,
  exclude,
});
