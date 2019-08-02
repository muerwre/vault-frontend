import { IModalState } from '~/redux/modal/reducer';
import { MODAL_ACTIONS } from '~/redux/modal/constants';

export const modalSetShown = (is_shown: IModalState['is_shown']) => ({
  is_shown,
  type: MODAL_ACTIONS.SET_SHOWN,
});

export const modalSetDialog = (dialog: IModalState['dialog']) => ({
  dialog,
  type: MODAL_ACTIONS.SET_DIALOG,
});

export const modalShowDialog = (dialog: IModalState['dialog']) => ({
  dialog,
  type: MODAL_ACTIONS.SHOW_DIALOG,
});
