import { MODAL_ACTIONS } from '~/redux/modal/constants';

const setShown = (state, { is_shown }) => ({ ...state, is_shown });
const showDialog = (state, { dialog }) => ({ ...state, dialog, is_shown: true });
const setDialog = (state, { dialog }) => ({ ...state, dialog });

export const MODAL_HANDLERS = {
  [MODAL_ACTIONS.SET_SHOWN]: setShown,
  [MODAL_ACTIONS.SHOW_DIALOG]: showDialog,
  [MODAL_ACTIONS.SET_DIALOG]: setDialog,
};
