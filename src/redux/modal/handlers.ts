import { MODAL_ACTIONS } from '~/redux/modal/constants';
import { modalSet } from './actions';

const setState = (state, { modal }: ReturnType<typeof modalSet>) => ({ ...state, ...modal });
const setShown = (state, { is_shown }) => ({ ...state, is_shown });
const showDialog = (state, { dialog }) => ({ ...state, dialog, is_shown: true });
const setDialog = (state, { dialog }) => ({ ...state, dialog });

export const MODAL_HANDLERS = {
  [MODAL_ACTIONS.SET]: setState,
  [MODAL_ACTIONS.SET_SHOWN]: setShown,
  [MODAL_ACTIONS.SHOW_DIALOG]: showDialog,
  [MODAL_ACTIONS.SET_DIALOG]: setDialog,
};
