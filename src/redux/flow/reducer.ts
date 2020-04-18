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
    is_loading: boolean;
    results: INode[];
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
    is_loading: false,
    results: [],
  },
  is_loading: false,
  error: null,
};

export default createReducer(INITIAL_STATE, FLOW_HANDLERS);
