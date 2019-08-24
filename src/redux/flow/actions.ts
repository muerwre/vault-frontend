import { FLOW_ACTIONS } from './constants';
import { IFlowState } from './reducer';

export const flowSetNodes = (nodes: IFlowState['nodes']) => ({
  nodes,
  type: FLOW_ACTIONS.SET_NODES,
});
