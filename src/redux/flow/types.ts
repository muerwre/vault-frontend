import { INode } from '~/redux/types';

export type GetSearchResultsRequest = {
  text: string;
  skip?: number;
};
export type GetSearchResultsResult = {
  nodes: INode[];
  total: number;
};
