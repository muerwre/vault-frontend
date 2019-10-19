import { ValueOf } from '~/redux/types';
import { LoginDialog } from '~/containers/dialogs/LoginDialog';
import { EditorDialogImage } from '~/containers/editors/EditorDialogImage';
import { EditorDialogText } from '~/containers/editors/EditorDialogText';
import { EditorDialogVideo } from '~/containers/editors/EditorDialogVideo';
import { NODE_TYPES } from '../node/constants';

export const MODAL_ACTIONS = {
  SET_SHOWN: 'MODAL.SET_SHOWN',
  SET_DIALOG: 'SET_DIALOG',
  SHOW_DIALOG: 'SHOW_DIALOG',
};

export const DIALOGS = {
  EDITOR_IMAGE: 'EDITOR_IMAGE',
  EDITOR_TEXT: 'EDITOR_TEXT',
  EDITOR_VIDEO: 'EDITOR_VIDEO',
  LOGIN: 'LOGIN',
};

export const DIALOG_CONTENT = {
  [DIALOGS.EDITOR_IMAGE]: EditorDialogImage,
  [DIALOGS.EDITOR_TEXT]: EditorDialogText,
  [DIALOGS.EDITOR_VIDEO]: EditorDialogVideo,
  [DIALOGS.LOGIN]: LoginDialog,
};

export const NODE_EDITOR_DIALOGS = {
  [NODE_TYPES.IMAGE]: DIALOGS.EDITOR_IMAGE,
  [NODE_TYPES.TEXT]: DIALOGS.EDITOR_TEXT,
  [NODE_TYPES.VIDEO]: DIALOGS.EDITOR_VIDEO,
};

export interface IDialogProps {
  onRequestClose: () => void;
  onDialogChange: (dialog: ValueOf<typeof DIALOGS>) => void;
}
