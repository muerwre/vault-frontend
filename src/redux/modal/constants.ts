import { ValueOf } from '~/redux/types';

export const DIALOGS = {
  EDITOR_IMAGE: 'EDITOR_IMAGE',
  EDITOR_TEXT: 'EDITOR_TEXT',
  EDITOR_VIDEO: 'EDITOR_VIDEO',
  EDITOR_AUDIO: 'EDITOR_AUDIO',
  LOGIN: 'LOGIN',
  LOGIN_SOCIAL_REGISTER: 'LOGIN_SOCIAL_REGISTER',
  LOADING: 'LOADING',
  PROFILE: 'PROFILE',
  RESTORE_REQUEST: 'RESTORE_REQUEST',
  RESTORE_PASSWORD: 'RESTORE_PASSWORD',
  TEST: 'TEST',
  PHOTOSWIPE: 'PHOTOSWIPE',
};

const prefix = 'MODAL.';

export const MODAL_ACTIONS = {
  SET: `${prefix}SET`,
  SET_SHOWN: `${prefix}MODAL.SET_SHOWN`,
  SET_DIALOG: `${prefix}SET_DIALOG`,
  SHOW_DIALOG: `${prefix}SHOW_DIALOG`,
  SHOW_PHOTOSWIPE: `${prefix}SHOW_PHOTOSWIPE`,
};

export interface IDialogProps {
  onRequestClose: () => void;
  onDialogChange: (dialog: ValueOf<typeof DIALOGS>) => void;
}
