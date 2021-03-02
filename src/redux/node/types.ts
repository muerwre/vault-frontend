import { INode } from '~/redux/types';

export interface IEditorComponentProps {
  data: INode;
  setData: (data: INode) => void;
  temp: string[];
  setTemp: (val: string[]) => void;
}

export type GetNodeDiffRequest = {
  start?: string;
  end?: string;
  take?: number;
  with_heroes: boolean;
  with_updated: boolean;
  with_recent: boolean;
  with_valid: boolean;
};

export type GetNodeDiffResult = {
  before?: INode[];
  after?: INode[];
  heroes?: INode[];
  recent?: INode[];
  updated?: INode[];
  valid: INode['id'][];
};

export type PostCellViewRequest = {
  id: INode['id'];
  flow: INode['flow'];
};
export type PostCellViewResult = unknown; // TODO: update it with actual type
