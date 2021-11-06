import { createReducer } from '~/utils/reducer';
import { IError, IFlowNode, INode } from '../types';
import { FLOW_HANDLERS } from './handlers';

export type IFlowState = Readonly<{
  isLoading: boolean;
  nodes: IFlowNode[];
  heroes: IFlowNode[];
  recent: IFlowNode[];
  updated: IFlowNode[];
  search: {
    text: string;
    results: INode[];
    total: number;
    is_loading: boolean;
    is_loading_more: boolean;
  };
  error: IError;
}>;

const INITIAL_STATE: IFlowState = {
  nodes: [],
  heroes: [],
  recent: [],
  updated: [],
  search: {
    text: '',
    results: [],
    total: 0,
    is_loading: false,
    is_loading_more: false,
  },
  isLoading: false,
  error: '',
};

export default createReducer(INITIAL_STATE, FLOW_HANDLERS);
