import { IBlock, INode, ValueOf } from '../types';
import { NodeImageBlock } from '~/components/node/NodeImageBlock';
import { NodeImageBlockPlaceholder } from '~/components/node/NodeImageBlockPlaceholder';
import { ReactElement, FC } from 'react';

const prefix = 'NODE.';
export const NODE_ACTIONS = {
  SAVE: `${prefix}NODE.SAVE`,
  LOAD_NODE: `${prefix}LOAD_NODE`,

  SET_SAVE_ERRORS: `${prefix}NODE.SET_SAVE_ERRORS`,
  SET_LOADING: `${prefix}NODE.SET_LOADING`,
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

type INodeComponents = Record<
  ValueOf<typeof NODE_TYPES>,
  Record<'component' | 'placeholder', FC<{ node: INode }>>
>;

export const NODE_COMPONENTS: INodeComponents = {
  [NODE_TYPES.IMAGE]: {
    component: NodeImageBlock,
    placeholder: NodeImageBlockPlaceholder,
  },
};
