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
import { RestoreRequestDialog } from '~/containers/dialogs/RestoreRequestDialog';

export const DIALOGS = {
  EDITOR_IMAGE: 'EDITOR_IMAGE',
  EDITOR_TEXT: 'EDITOR_TEXT',
  EDITOR_VIDEO: 'EDITOR_VIDEO',
  EDITOR_AUDIO: 'EDITOR_AUDIO',
  LOGIN: 'LOGIN',
  LOADING: 'LOADING',
  PROFILE: 'PROFILE',
  RESTORE_REQUEST: 'RESTORE_REQUEST',
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
