import { MODAL_HANDLERS } from '~/redux/modal/handlers';
import { createReducer } from '~/utils/reducer';
import { DIALOGS } from '~/redux/modal/constants';
import { ValueOf } from '~/redux/types';

export interface IModalState {
  is_shown: boolean;
  dialog: ValueOf<typeof DIALOGS>;
}

const INITIAL_STATE: IModalState = {
  is_shown: true,
  dialog: DIALOGS.LOGIN,
};

export default createReducer(INITIAL_STATE, MODAL_HANDLERS);
