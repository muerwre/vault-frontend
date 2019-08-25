import { createReducer } from '~/utils/reducer';
import { INode, IComment } from '../types';
import { EMPTY_NODE } from './constants';
import { NODE_HANDLERS } from './handlers';

export type INodeState = Readonly<{
  editor: INode;
  current: INode;
  comments: IComment[];

  error: string;
  errors: Record<string, string>;

  is_loading: boolean;
  is_loading_comments: boolean;
}>;

const INITIAL_STATE: INodeState = {
  editor: {
    ...EMPTY_NODE,
    type: 'image',
    blocks: [],
    files: [],
  },
  current: { ...EMPTY_NODE },
  comments: [],
  is_loading: false,
  is_loading_comments: false,
  error: null,
  errors: {},
};

export default createReducer(INITIAL_STATE, NODE_HANDLERS);
