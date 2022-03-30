import { IError, INode, ITag } from '~/types';

export enum LabNodesSort {
  New = 'new',
  Hot = 'hot',
  Heroic = 'heroic',
}

export type GetLabNodesRequest = {
  limit?: number;
  offset?: number;
  after?: string;
  sort?: LabNodesSort;
  search?: string;
};

export interface ILabNode {
  node: INode;
  last_seen: string | null | undefined;
  comment_count: number;
}

export type GetLabNodesResult = {
  nodes: ILabNode[];
  count: number;
};

export type GetLabStatsResult = {
  heroes: INode[];
  tags: ITag[];
};

export type GetLabUpdatesResult = {
  nodes: INode[];
};
