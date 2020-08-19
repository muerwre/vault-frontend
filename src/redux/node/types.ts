import { INode } from '~/redux/types';

export interface IEditorComponentProps {
  data: INode;
  setData: (data: INode) => void;
  temp: string[];
  setTemp: (val: string[]) => void;
}
