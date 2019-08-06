import { INode } from "../types";

export const EMPTY_NODE: INode = {
  id: null,

  user_id: null,

  title: '',
  files: [],

  cover: null,
  type: null,

  options: {
    flow: {
      display: 'single',
      show_description: false,
    }
  },
}