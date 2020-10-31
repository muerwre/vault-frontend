import { createReducer } from '~/utils/reducer';
import { INode } from '~/redux/types';
import { TAG_HANDLERS } from '~/redux/tag/handlers';

export interface ITagState {
  nodes: {
    list: INode[];
    count: number;
    isLoading: boolean;
  };
  autocomplete: {
    isLoading: boolean;
    options: string[];
  };
}

const INITIAL_STATE: ITagState = {
  nodes: {
    list: [],
    count: 0,
    isLoading: true,
  },
  autocomplete: {
    isLoading: true,
    options: [],
  },
};

export default createReducer(INITIAL_STATE, TAG_HANDLERS);
