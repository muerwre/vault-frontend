import assocPath from 'ramda/es/assocPath';
import { FLOW_ACTIONS } from './constants';
import {
  flowSetNodes,
  flowSetHeroes,
  flowSetRecent,
  flowSetUpdated,
  flowSetFlow,
  flowSetSearch,
} from './actions';
import { IFlowState } from './reducer';

const setNodes = (state: IFlowState, { nodes }: ReturnType<typeof flowSetNodes>) =>
  assocPath(['nodes'], nodes, state);

const setHeroes = (state: IFlowState, { heroes }: ReturnType<typeof flowSetHeroes>) =>
  assocPath(['heroes'], heroes, state);

const setRecent = (state: IFlowState, { recent }: ReturnType<typeof flowSetRecent>) =>
  assocPath(['recent'], recent, state);

const setUpdated = (state: IFlowState, { updated }: ReturnType<typeof flowSetUpdated>) =>
  assocPath(['updated'], updated, state);

const setFlow = (state: IFlowState, { data }: ReturnType<typeof flowSetFlow>): IFlowState => ({
  ...state,
  ...data,
});

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
  [FLOW_ACTIONS.SET_NODES]: setNodes,
  [FLOW_ACTIONS.SET_HEROES]: setHeroes,
  [FLOW_ACTIONS.SET_RECENT]: setRecent,
  [FLOW_ACTIONS.SET_UPDATED]: setUpdated,
  [FLOW_ACTIONS.SET_FLOW]: setFlow,
  [FLOW_ACTIONS.SET_SEARCH]: setSearch,
};
