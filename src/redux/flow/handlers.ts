import assocPath from 'ramda/es/assocPath';
import { FLOW_ACTIONS } from './constants';
import { flowSetNodes } from './actions';
import { IFlowState } from './reducer';

const setNodes = (state: IFlowState, { nodes }: ReturnType<typeof flowSetNodes>) =>
  assocPath(['nodes'], nodes, state);

export const FLOW_HANDLERS = {
  [FLOW_ACTIONS.SET_NODES]: setNodes,
};
