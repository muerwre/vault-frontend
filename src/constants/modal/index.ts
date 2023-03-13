import { EditorCreateDialog } from '~/containers/dialogs/EditorCreateDialog';
import { EditorEditDialog } from '~/containers/dialogs/EditorEditDialog';
import { LoadingDialog } from '~/containers/dialogs/LoadingDialog';
import { LoginDialog } from '~/containers/dialogs/LoginDialog';
import { LoginSocialRegisterDialog } from '~/containers/dialogs/LoginSocialRegisterDialog';
import { PhotoSwipe } from '~/containers/dialogs/PhotoSwipe';
import { RestorePasswordDialog } from '~/containers/dialogs/RestorePasswordDialog';
import { RestoreRequestDialog } from '~/containers/dialogs/RestoreRequestDialog';
import { TelegramAttachDialog } from '~/containers/dialogs/TelegramAttachDialog';
import { TestDialog } from '~/containers/dialogs/TestDialog';

export enum Dialog {
  Login = 'Login',
  LoginSocialRegister = 'LoginSocialRegister',
  Loading = 'Loading',
  RestoreRequest = 'RestoreRequest',
  RestorePassword = 'RestorePassword',
  Test = 'Test',
  Photoswipe = 'Photoswipe',
  CreateNode = 'CreateNode',
  EditNode = 'EditNode',
  TelegramAttach = 'TelegramAttach',
}

export const DIALOG_CONTENT = {
  [Dialog.Login]: LoginDialog,
  [Dialog.LoginSocialRegister]: LoginSocialRegisterDialog,
  [Dialog.Loading]: LoadingDialog,
  [Dialog.Test]: TestDialog,
  [Dialog.RestoreRequest]: RestoreRequestDialog,
  [Dialog.RestorePassword]: RestorePasswordDialog,
  [Dialog.Photoswipe]: PhotoSwipe,
  [Dialog.CreateNode]: EditorCreateDialog,
  [Dialog.EditNode]: EditorEditDialog,
  [Dialog.TelegramAttach]: TelegramAttachDialog,
} as const;
