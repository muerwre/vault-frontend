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

export const flowSetRecent = (recent: IFlowState['recent']) => ({
  recent,
  type: FLOW_ACTIONS.SET_RECENT,
});

export const flowSetUpdated = (updated: IFlowState['updated']) => ({
  updated,
  type: FLOW_ACTIONS.SET_UPDATED,
});

export const flowSetCellView = (id: INode['id'], flow: INode['flow']) => ({
  type: FLOW_ACTIONS.SET_CELL_VIEW,
  id,
  flow,
});

export const flowGetMore = () => ({
  type: FLOW_ACTIONS.GET_MORE,
});

export const flowSetFlow = (data: Partial<IFlowState>) => ({
  type: FLOW_ACTIONS.SET_FLOW,
  data,
});

export const flowSetSearch = (search: Partial<IFlowState['search']>) => ({
  type: FLOW_ACTIONS.SET_SEARCH,
  search,
});

export const flowChangeSearch = (search: Partial<IFlowState['search']>) => ({
  type: FLOW_ACTIONS.CHANGE_SEARCH,
  search,
});

export const flowLoadMoreSearch = () => ({
  type: FLOW_ACTIONS.LOAD_MORE_SEARCH,
});
