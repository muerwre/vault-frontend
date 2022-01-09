import { IError, INode, ITag } from '~/types';

export type ILabState = Readonly<{
  list: {
    is_loading: boolean;
    nodes: ILabNode[];
    count: number;
    error: IError;
  };
  stats: {
    is_loading: boolean;
    heroes: Partial<INode>[];
    tags: ITag[];
    error?: string;
  };
  updates: {
    nodes: INode[];
    isLoading: boolean;
  };
}>;

export type GetLabNodesRequest = {
  after?: string;
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
