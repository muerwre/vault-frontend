import { createReducer } from '~/utils/reducer';
import { INode, IError } from '../types';
import { FLOW_HANDLERS } from './handlers';

export type IFlowState = Readonly<{
  is_loading: boolean;
  nodes: INode[];
  heroes: Partial<INode>[];
  recent: Partial<INode>[];
  updated: Partial<INode>[];
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
  is_loading: false,
  error: '',
};

export default createReducer(INITIAL_STATE, FLOW_HANDLERS);
