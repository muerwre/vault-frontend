import assocPath from 'ramda/es/assocPath';
import { FLOW_ACTIONS } from './constants';
import { flowSetNodes, flowSetHeroes } from './actions';
import { IFlowState } from './reducer';

const setNodes = (state: IFlowState, { nodes }: ReturnType<typeof flowSetNodes>) =>
  assocPath(['nodes'], nodes, state);

const setHeroes = (state: IFlowState, { heroes }: ReturnType<typeof flowSetHeroes>) =>
  assocPath(['heroes'], heroes, state);

export const FLOW_HANDLERS = {
  [FLOW_ACTIONS.SET_NODES]: setNodes,
  [FLOW_ACTIONS.SET_HEROES]: setHeroes,
};
