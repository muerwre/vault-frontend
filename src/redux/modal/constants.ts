import { ValueOf } from '~/redux/types';
import { EditorDialog } from '~/containers/dialogs/EditorDialog';
import { LoginDialog } from '~/containers/dialogs/LoginDialog';

export const MODAL_ACTIONS = {
  SET_SHOWN: 'MODAL.SET_SHOWN',
  SET_DIALOG: 'SET_DIALOG',
  SHOW_DIALOG: 'SHOW_DIALOG',
};

export const DIALOGS = {
  EDITOR_IMAGE: 'EDITOR_IMAGE',
  LOGIN: 'LOGIN',
};

export const DIALOG_CONTENT = {
  [DIALOGS.EDITOR_IMAGE]: EditorDialog,
  [DIALOGS.LOGIN]: LoginDialog,
};

export interface IDialogProps {
  onRequestClose: () => void;
  onDialogChange: (dialog: ValueOf<typeof DIALOGS>) => void;
}
