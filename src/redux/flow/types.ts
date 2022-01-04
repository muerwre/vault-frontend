import { INode } from '~/redux/types';

export type GetSearchResultsRequest = {
  text: string;
  take: number;
  skip: number;
};
export type GetSearchResultsResult = {
  nodes: INode[];
  total: number;
};
