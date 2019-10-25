import { FLOW_ACTIONS } from './constants';
import { IFlowState } from './reducer';
import { INode } from '../types';

export const flowSetNodes = (nodes: IFlowState['nodes']) => ({
  nodes,
  type: FLOW_ACTIONS.SET_NODES,
});

export const flowSetHeroes = (heroes: IFlowState['heroes']) => ({
  heroes,
  type: FLOW_ACTIONS.SET_HEROES,
});

export const flowSetCellView = (id: INode['id'], flow: INode['flow']) => ({
  type: FLOW_ACTIONS.SET_CELL_VIEW,
  id,
  flow,
});
