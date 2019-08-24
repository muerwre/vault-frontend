import { INode } from '../types';
import { FLOW_ACTIONS } from './constants';

export const flowSetNodes = (nodes: INode[]) => ({
  nodes,
  type: FLOW_ACTIONS.SET_NODES,
});
