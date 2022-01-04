import { FLOW_ACTIONS } from './constants';
import { IFlowState } from './reducer';
import { INode } from '../types';

export const flowSetCellView = (id: INode['id'], flow: INode['flow']) => ({
  type: FLOW_ACTIONS.SET_CELL_VIEW,
  id,
  flow,
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
