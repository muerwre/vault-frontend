import { lazy } from 'react';

import { LoginDialog } from '~/containers/auth/LoginDialog';
import { LoginSocialRegisterDialog } from '~/containers/auth/LoginSocialRegisterDialog';
import { RestorePasswordDialog } from '~/containers/auth/RestorePasswordDialog';
import { RestoreRequestDialog } from '~/containers/auth/RestoreRequestDialog';
import { TelegramAttachDialog } from '~/containers/auth/TelegramAttachDialog';
import { EditorCreateDialog } from '~/containers/dialogs/EditorCreateDialog';
import { EditorEditDialog } from '~/containers/dialogs/EditorEditDialog';
import { LoadingDialog } from '~/containers/dialogs/LoadingDialog';
import { TestDialog } from '~/containers/dialogs/TestDialog';

const PhotoSwipe = lazy(() =>
  import('~/containers/dialogs/PhotoSwipe').then((it) => ({
    default: it.PhotoSwipe,
  })),
);

export enum Dialog {
  Login = 'Login',
  Register = 'Register',
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
  [Dialog.Register]: LoginDialog, // TODO: make inviting dialog
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
