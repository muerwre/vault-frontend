import { NODE_TYPES } from '~/redux/node/constants';
import { EditorDialogImage } from '~/containers/editors/EditorDialogImage';
import { EditorDialogText } from '~/containers/editors/EditorDialogText';
import { EditorDialogVideo } from '~/containers/editors/EditorDialogVideo';
import { EditorDialogAudio } from '~/containers/editors/EditorDialogAudio';
import { LoginDialog } from '~/containers/dialogs/LoginDialog';
import { LoadingDialog } from '~/containers/dialogs/LoadingDialog';
import { TestDialog } from '~/containers/dialogs/TestDialog';
import { ProfileDialog } from '~/containers/dialogs/ProfileDialog';
import { RestoreRequestDialog } from '~/containers/dialogs/RestoreRequestDialog';
import { RestorePasswordDialog } from '~/containers/dialogs/RestorePasswordDialog';
import { DIALOGS } from '~/redux/modal/constants';

export const DIALOG_CONTENT = {
  [DIALOGS.EDITOR_IMAGE]: EditorDialogImage,
  [DIALOGS.EDITOR_TEXT]: EditorDialogText,
  [DIALOGS.EDITOR_VIDEO]: EditorDialogVideo,
  [DIALOGS.EDITOR_AUDIO]: EditorDialogAudio,
  [DIALOGS.LOGIN]: LoginDialog,
  [DIALOGS.LOADING]: LoadingDialog,
  [DIALOGS.TEST]: TestDialog,
  [DIALOGS.PROFILE]: ProfileDialog,
  [DIALOGS.RESTORE_REQUEST]: RestoreRequestDialog,
  [DIALOGS.RESTORE_PASSWORD]: RestorePasswordDialog,
};

export const NODE_EDITOR_DIALOGS = {
  [NODE_TYPES.IMAGE]: DIALOGS.EDITOR_IMAGE,
  [NODE_TYPES.TEXT]: DIALOGS.EDITOR_TEXT,
  [NODE_TYPES.VIDEO]: DIALOGS.EDITOR_VIDEO,
  [NODE_TYPES.AUDIO]: DIALOGS.EDITOR_AUDIO,
};
