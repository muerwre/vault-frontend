import { FLOW_ACTIONS } from './constants';
import { flowSetSearch } from './actions';
import { IFlowState } from './reducer';

const setSearch = (
  state: IFlowState,
  { search }: ReturnType<typeof flowSetSearch>
): IFlowState => ({
  ...state,
  search: {
    ...state.search,
    ...search,
  },
});

export const FLOW_HANDLERS = {
  [FLOW_ACTIONS.SET_SEARCH]: setSearch,
};
