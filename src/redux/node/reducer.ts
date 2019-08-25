import { createReducer } from '~/utils/reducer';
import { INode, IComment } from '../types';
import { EMPTY_NODE } from './constants';
import { NODE_HANDLERS } from './handlers';

export type INodeState = Readonly<{
  is_loading: boolean;
  editor: INode;
  current: Partial<INode>;
  comments: IComment[];
  error: string;
  errors: Record<string, string>;
}>;

const INITIAL_STATE: INodeState = {
  editor: {
    ...EMPTY_NODE,
    type: 'image',
    blocks: [],
    files: [],
  },
  current: {},
  comments: [],
  is_loading: false,
  error: null,
  errors: {},
};

export default createReducer(INITIAL_STATE, NODE_HANDLERS);
