import { createReducer } from '~/utils/reducer';
import { LAB_HANDLERS } from '~/redux/lab/handlers';
import { ILabState } from '~/redux/lab/types';

const INITIAL_STATE: ILabState = {
  list: {
    is_loading: false,
    nodes: [],
    count: 0,
    error: '',
  },
  stats: {
    is_loading: false,
    heroes: [],
    tags: [],
    error: undefined,
  },
  updates: {
    nodes: [],
    isLoading: false,
  },
};

export default createReducer(INITIAL_STATE, LAB_HANDLERS);
