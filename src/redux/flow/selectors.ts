import { IState } from '../store';
import { INodeState } from './reducer';

export const selectNode = (state: IState): INodeState => state.node;
