import uuid from 'uuid4';
import { createReducer } from '~/utils/reducer';
import { INode } from '../types';
import { EMPTY_BLOCK, EMPTY_NODE } from './constants';
import { NODE_HANDLERS } from './handlers';
import { EMPTY_FILE } from '../uploads/constants';

export type INodeState = Readonly<{
  is_loading: boolean;
  editor: INode;
  current: INode;
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
  current: null,
  is_loading: false,
  error: null,
  errors: {},
};

export default createReducer(INITIAL_STATE, NODE_HANDLERS);
