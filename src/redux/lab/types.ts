import { IError, INode } from '~/redux/types';

export type ILabState = Readonly<{
  list: {
    is_loading: boolean;
    nodes: INode[];
    count: number;
    error: IError;
  };
}>;

export type GetLabNodesRequest = {
  after?: string;
};

export type GetLabNodesResult = {
  nodes: INode[];
  count: number;
};
