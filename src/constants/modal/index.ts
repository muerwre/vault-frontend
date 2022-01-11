import { LoginDialog } from '~/containers/dialogs/LoginDialog';
import { LoginSocialRegisterDialog } from '~/containers/dialogs/LoginSocialRegisterDialog';
import { LoadingDialog } from '~/containers/dialogs/LoadingDialog';
import { TestDialog } from '~/containers/dialogs/TestDialog';
import { ProfileDialog } from '~/containers/dialogs/ProfileDialog';
import { RestoreRequestDialog } from '~/containers/dialogs/RestoreRequestDialog';
import { RestorePasswordDialog } from '~/containers/dialogs/RestorePasswordDialog';
import { PhotoSwipe } from '~/containers/dialogs/PhotoSwipe';
import { EditorCreateDialog } from '~/containers/dialogs/EditorCreateDialog';
import { EditorEditDialog } from '~/containers/dialogs/EditorEditDialog';
import { TagSidebar } from '~/containers/sidebars/TagSidebar';
import { ProfileSidebar } from '~/containers/sidebars/ProfileSidebar';

export enum Dialog {
  Login = 'Login',
  LoginSocialRegister = 'LoginSocialRegister',
  Loading = 'Loading',
  Profile = 'Profile',
  RestoreRequest = 'RestoreRequest',
  RestorePassword = 'RestorePassword',
  Test = 'Test',
  Photoswipe = 'Photoswipe',
  CreateNode = 'CreateNode',
  EditNode = 'EditNode',
  TagSidebar = 'TagNodes',
  ProfileSidebar = 'ProfileSidebar',
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
  [Dialog.CreateNode]: EditorCreateDialog,
  [Dialog.EditNode]: EditorEditDialog,
  [Dialog.TagSidebar]: TagSidebar,
  [Dialog.ProfileSidebar]: ProfileSidebar,
} as const;
