import { ValueOf } from '~/redux/types';
import { HorizontalExample } from '~/containers/examples/HorizontalExample';
import { ExampleDialog } from '~/containers/dialogs/ExampleDialog';
import { LoginDialog } from '~/containers/dialogs/LoginDialog';

export const MODAL_ACTIONS = {
  SET_SHOWN: 'MODAL.SET_SHOWN',
  SET_DIALOG: 'SET_DIALOG',
  SHOW_DIALOG: 'SHOW_DIALOG',
};

export const DIALOGS = {
  EDITOR: 'EDITOR',
  LOGIN: 'LOGIN',
};

export const DIALOG_CONTENT = {
  [DIALOGS.EDITOR]: ExampleDialog,
  [DIALOGS.LOGIN]: LoginDialog,
};

export interface IDialogProps {
  onRequestClose: () => void;
  onDialogChange: (dialog: ValueOf<typeof DIALOGS>) => void;
}
