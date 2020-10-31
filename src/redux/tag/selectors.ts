import { IState } from '~/redux/store';

export const selectTag = (state: IState) => state.tag;
export const selectTagNodes = (state: IState) => state.tag.nodes;
