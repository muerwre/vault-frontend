import { createReducer } from '~/utils/reducer';
import { LAB_HANDLERS } from '~/redux/lab/handlers';
import { ILabState } from '~/redux/lab/types';
import { INode, ITag } from '~/redux/types';

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
};

export default createReducer(INITIAL_STATE, LAB_HANDLERS);
