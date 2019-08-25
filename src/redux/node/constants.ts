import { FC } from 'react';
import { IBlock, INode, ValueOf } from '../types';
import { NodeImageBlock } from '~/components/node/NodeImageBlock';
import { NodeImageBlockPlaceholder } from '~/components/node/NodeImageBlockPlaceholder';

const prefix = 'NODE.';
export const NODE_ACTIONS = {
  SAVE: `${prefix}SAVE`,
  LOAD_NODE: `${prefix}LOAD_NODE`,

  SET_SAVE_ERRORS: `${prefix}SET_SAVE_ERRORS`,
  SET_LOADING: `${prefix}SET_LOADING`,
  SET_CURRENT: `${prefix}SET_CURRENT`,
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
