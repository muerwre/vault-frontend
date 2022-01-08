import { LoginDialog } from '~/containers/dialogs/LoginDialog';
import { LoginSocialRegisterDialog } from '~/containers/dialogs/LoginSocialRegisterDialog';
import { LoadingDialog } from '~/containers/dialogs/LoadingDialog';
import { TestDialog } from '~/containers/dialogs/TestDialog';
import { ProfileDialog } from '~/containers/dialogs/ProfileDialog';
import { RestoreRequestDialog } from '~/containers/dialogs/RestoreRequestDialog';
import { RestorePasswordDialog } from '~/containers/dialogs/RestorePasswordDialog';
import { PhotoSwipe } from '~/containers/dialogs/PhotoSwipe';

export enum Dialog {
  Login = 'Login',
  LoginSocialRegister = 'LoginSocialRegister',
  Loading = 'Loading',
  Profile = 'Profile',
  RestoreRequest = 'RestoreRequest',
  RestorePassword = 'RestorePassword',
  Test = 'Test',
  Photoswipe = 'Photoswipe',
}

export const DIALOG_CONTENT = {
  [Dialog.Login]: LoginDialog,
  [Dialog.LoginSocialRegister]: LoginSocialRegisterDialog,
  [Dialog.Loading]: LoadingDialog,
  [Dialog.Test]: TestDialog,
  [Dialog.Profile]: ProfileDialog,
  [Dialog.RestoreRequest]: RestoreRequestDialog,
  [Dialog.RestorePassword]: RestorePasswordDialog,
  [Dialog.Photoswipe]: PhotoSwipe,
} as const;
