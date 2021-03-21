import { IState } from '~/redux/store';

export const selectLab = (state: IState) => state.lab;
export const selectLabListNodes = (state: IState) => state.lab.list.nodes;
