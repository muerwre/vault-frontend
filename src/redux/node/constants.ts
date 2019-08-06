import {IBlock, INode} from "../types";

export const EMPTY_BLOCK: IBlock = {
  type: null,
  temp_ids: [],
  attaches: [],
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
    }
  },
}
