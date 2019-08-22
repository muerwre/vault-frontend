import { IBlock, INode } from '../types';

export const NODE_ACTIONS = {
  SAVE: 'NODE.SAVE',
  SET_SAVE_ERRORS: 'NODE.SET_SAVE_ERRORS',
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
