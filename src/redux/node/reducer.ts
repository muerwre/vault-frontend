import { createReducer } from '~/utils/reducer';
import { IComment, IFile, INode } from '../types';
import { EMPTY_COMMENT, EMPTY_NODE } from './constants';
import { NODE_HANDLERS } from './handlers';
import { INodeRelated } from '~/redux/node/types';

export type INodeState = Readonly<{
  editor: INode;
  current: INode;
  comments: IComment[];
  related: INodeRelated;
  comment_data: Record<number, IComment>;
  comment_count: number;
  current_cover_image?: IFile;

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
  comment_data: {
    0: {
      ...EMPTY_COMMENT,
    },
  },
  comment_count: 0,
  comments: [],
  related: {
    albums: {},
    similar: [],
  },
  current_cover_image: undefined,

  is_loading: false,
  is_loading_comments: false,
  is_sending_comment: false,

  error: '',
  errors: {},
};

export default createReducer(INITIAL_STATE, NODE_HANDLERS);
