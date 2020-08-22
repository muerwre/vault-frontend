import { MODAL_HANDLERS } from '~/redux/modal/handlers';
import { createReducer } from '~/utils/reducer';
import { DIALOGS } from '~/redux/modal/constants';
import { ValueOf, IFile } from '~/redux/types';

export interface IModalState {
  is_shown: boolean;
  dialog: ValueOf<typeof DIALOGS>;
  photoswipe: {
    images: IFile[];
    index: number;
  };
}

const INITIAL_STATE: IModalState = {
  is_shown: false,
  dialog: null,
  photoswipe: {
    images: [],
    index: 0,
  },
};

export default createReducer(INITIAL_STATE, MODAL_HANDLERS);
