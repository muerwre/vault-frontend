import { IState } from '../store';

export const selectNode = (state: IState) => state.node;
export const selectNodeComments = (state: IState) => state.node.comments;
export const selectNodeCurrent = (state: IState) => state.node.current;
export const selectNodeEditor = (state: IState) => state.node.editor;
