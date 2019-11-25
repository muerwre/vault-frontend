import { ValueOf } from '~/redux/types';

export const DIALOGS = {
  EDITOR_IMAGE: 'EDITOR_IMAGE',
  EDITOR_TEXT: 'EDITOR_TEXT',
  EDITOR_VIDEO: 'EDITOR_VIDEO',
  EDITOR_AUDIO: 'EDITOR_AUDIO',
  LOGIN: 'LOGIN',
  LOADING: 'LOADING',
  PROFILE: 'PROFILE',
  RESTORE_REQUEST: 'RESTORE_REQUEST',
  RESTORE_PASSWORD: 'RESTORE_PASSWORD',
  TEST: 'TEST',
};

export const MODAL_ACTIONS = {
  SET_SHOWN: 'MODAL.SET_SHOWN',
  SET_DIALOG: 'SET_DIALOG',
  SHOW_DIALOG: 'SHOW_DIALOG',
};

export interface IDialogProps {
  onRequestClose: () => void;
  onDialogChange: (dialog: ValueOf<typeof DIALOGS>) => void;
}
