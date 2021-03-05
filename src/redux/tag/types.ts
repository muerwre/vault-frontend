import { INode } from '~/redux/types';

export type ApiGetNodesOfTagRequest = {
  tag: string;
  offset: number;
  limit: number;
};
export type ApiGetNodesOfTagResult = { nodes: INode[]; count: number };

export type ApiGetTagSuggestionsRequest = {
  search: string;
  exclude: string[];
};
export type ApiGetTagSuggestionsResult = {
  tags: string[];
};
