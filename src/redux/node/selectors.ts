import { IState } from '../store';
import { INodeState } from './reducer';
import { IResultWithStatus, INode } from '../types';

export const selectNode = (state: IState): INodeState => state.node;

// export const catchNodeErrors = (data: IResultWithStatus<INode>): IResultWithStatus<INode> => ({
// data,
// errors: data.errors,
// })
