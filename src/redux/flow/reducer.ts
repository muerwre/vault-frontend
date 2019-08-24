import { createReducer } from '~/utils/reducer';
import { INode, UUID } from '../types';
import { FLOW_HANDLERS } from './handlers';

export type IFlowState = Readonly<{
  is_loading: boolean;
  nodes: Record<UUID, INode>;
}>;

const INITIAL_STATE: IFlowState = {
  nodes: {},
  is_loading: false,
};

export default createReducer(INITIAL_STATE, FLOW_HANDLERS);
