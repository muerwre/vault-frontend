import { ValueOf } from '~/redux/types';
import { LoginDialog } from '~/containers/dialogs/LoginDialog';
import { LoadingDialog } from '~/containers/dialogs/LoadingDialog';
import { EditorDialogImage } from '~/containers/editors/EditorDialogImage';
import { EditorDialogText } from '~/containers/editors/EditorDialogText';
import { EditorDialogVideo } from '~/containers/editors/EditorDialogVideo';
import { EditorDialogAudio } from '~/containers/editors/EditorDialogAudio';
import { NODE_TYPES } from '../node/constants';
import { TestDialog } from '~/containers/dialogs/TestDialog';
import { ProfileDialog } from '~/containers/dialogs/ProfileDialog';

export const MODAL_ACTIONS = {
  SET_SHOWN: 'MODAL.SET_SHOWN',
  SET_DIALOG: 'SET_DIALOG',
  SHOW_DIALOG: 'SHOW_DIALOG',
};

export const DIALOGS = {
  EDITOR_IMAGE: 'EDITOR_IMAGE',
  EDITOR_TEXT: 'EDITOR_TEXT',
  EDITOR_VIDEO: 'EDITOR_VIDEO',
  EDITOR_AUDIO: 'EDITOR_AUDIO',
  LOGIN: 'LOGIN',
  LOADING: 'LOADING',
  PROFILE: 'PROFILE',
  TEST: 'TEST',
};

export const DIALOG_CONTENT = {
  [DIALOGS.EDITOR_IMAGE]: EditorDialogImage,
  [DIALOGS.EDITOR_TEXT]: EditorDialogText,
  [DIALOGS.EDITOR_VIDEO]: EditorDialogVideo,
  [DIALOGS.EDITOR_AUDIO]: EditorDialogAudio,
  [DIALOGS.LOGIN]: LoginDialog,
  [DIALOGS.LOADING]: LoadingDialog,
  [DIALOGS.TEST]: TestDialog,
  [DIALOGS.PROFILE]: ProfileDialog,
};

export const NODE_EDITOR_DIALOGS = {
  [NODE_TYPES.IMAGE]: DIALOGS.EDITOR_IMAGE,
  [NODE_TYPES.TEXT]: DIALOGS.EDITOR_TEXT,
  [NODE_TYPES.VIDEO]: DIALOGS.EDITOR_VIDEO,
  [NODE_TYPES.AUDIO]: DIALOGS.EDITOR_AUDIO,
};

export interface IDialogProps {
  onRequestClose: () => void;
  onDialogChange: (dialog: ValueOf<typeof DIALOGS>) => void;
}
