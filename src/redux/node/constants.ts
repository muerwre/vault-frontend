import { FC } from 'react';
import { IBlock, INode, ValueOf, IComment } from '../types';
import { NodeImageBlock } from '~/components/node/NodeImageBlock';

const prefix = 'NODE.';
export const NODE_ACTIONS = {
  SAVE: `${prefix}SAVE`,
  LOAD_NODE: `${prefix}LOAD_NODE`,

  SET_SAVE_ERRORS: `${prefix}SET_SAVE_ERRORS`,
  SET_LOADING: `${prefix}SET_LOADING`,
  SET_LOADING_COMMENTS: `${prefix}SET_LOADING_COMMENTS`,
  SET_SENDING_COMMENT: `${prefix}SET_SENDING_COMMENT`,
  SET_CURRENT: `${prefix}SET_CURRENT`,
  SET_COMMENT_DATA: `${prefix}SET_COMMENT_DATA`,

  POST_COMMENT: `${prefix}POST_COMMENT`,
  SET_COMMENTS: `${prefix}SET_COMMENTS`,
};

export const EMPTY_BLOCK: IBlock = {
  type: null,
  files: [],
  content: null,
  embeds: [],
};

export const EMPTY_NODE: INode = {
  id: null,

  user_id: null,

  title: '',
  files: [],

  cover: null,
  type: null,

  blocks: [],

  options: {
    flow: {
      display: 'single',
      show_description: false,
    },
  },
};

export const NODE_TYPES = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  TEXT: 'text',
};

type INodeComponents = Record<ValueOf<typeof NODE_TYPES>, FC<{ node: INode; is_loading: boolean }>>;

export const NODE_COMPONENTS: INodeComponents = {
  [NODE_TYPES.IMAGE]: NodeImageBlock,
};

export const EMPTY_COMMENT: IComment = {
  text: '',
  files: [],
  is_private: false,
  owner: null,
};
