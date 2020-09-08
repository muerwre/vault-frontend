import { IState } from '~/redux/store';

export const selectMessages = (state: IState) => state.messages;
