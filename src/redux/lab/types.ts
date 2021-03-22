import { IError, INode, ITag } from '~/redux/types';

export type ILabState = Readonly<{
  list: {
    is_loading: boolean;
    nodes: INode[];
    count: number;
    error: IError;
  };
  stats: {
    is_loading: boolean;
    heroes: Partial<INode>[];
    tags: ITag[];
    error?: string;
  };
}>;

export type GetLabNodesRequest = {
  after?: string;
};

export type GetLabNodesResult = {
  nodes: INode[];
  count: number;
};

export type GetLabStatsResult = {
  heroes: INode[];
  tags: ITag[];
};
