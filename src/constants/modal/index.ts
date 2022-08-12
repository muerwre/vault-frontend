import { EditorCreateDialog } from '~/containers/dialogs/EditorCreateDialog';
import { EditorEditDialog } from '~/containers/dialogs/EditorEditDialog';
import { LoadingDialog } from '~/containers/dialogs/LoadingDialog';
import { LoginDialog } from '~/containers/dialogs/LoginDialog';
import { LoginSocialRegisterDialog } from '~/containers/dialogs/LoginSocialRegisterDialog';
import { PhotoSwipe } from '~/containers/dialogs/PhotoSwipe';
import { RestorePasswordDialog } from '~/containers/dialogs/RestorePasswordDialog';
import { RestoreRequestDialog } from '~/containers/dialogs/RestoreRequestDialog';
import { TestDialog } from '~/containers/dialogs/TestDialog';
import { TagSidebar } from '~/containers/sidebars/TagSidebar';

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
  TagSidebar = 'TagNodes',
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
  [Dialog.TagSidebar]: TagSidebar,
} as const;
