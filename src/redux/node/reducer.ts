import { createReducer } from '~/utils/reducer';
import { INode, IComment } from '../types';
import { EMPTY_NODE, EMPTY_COMMENT } from './constants';
import { NODE_HANDLERS } from './handlers';

export type INodeState = Readonly<{
  editor: INode;
  current: INode;
  comments: IComment[];
  comment_data: Record<number, IComment>;

  error: string;
  errors: Record<string, string>;

  is_loading: boolean;
  is_loading_comments: boolean;
  is_sending_comment: boolean;
}>;

const INITIAL_STATE: INodeState = {
  editor: {
    ...EMPTY_NODE,
    type: 'image',
    blocks: [],
    files: [],
  },
  current: { ...EMPTY_NODE },
  comment_data: { 0: { ...EMPTY_COMMENT } },
  comments: [],

  is_loading: false,
  is_loading_comments: false,
  is_sending_comment: false,

  error: null,
  errors: {},
};

export default createReducer(INITIAL_STATE, NODE_HANDLERS);
