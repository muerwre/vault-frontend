import { EditorCreateDialog } from '~/containers/dialogs/EditorCreateDialog';
import { EditorEditDialog } from '~/containers/dialogs/EditorEditDialog';
import { LoadingDialog } from '~/containers/dialogs/LoadingDialog';
import { LoginDialog } from '~/containers/dialogs/LoginDialog';
import { LoginSocialRegisterDialog } from '~/containers/dialogs/LoginSocialRegisterDialog';
import { PhotoSwipe } from '~/containers/dialogs/PhotoSwipe';
import { ProfileDialog } from '~/containers/dialogs/ProfileDialog';
import { RestorePasswordDialog } from '~/containers/dialogs/RestorePasswordDialog';
import { RestoreRequestDialog } from '~/containers/dialogs/RestoreRequestDialog';
import { TestDialog } from '~/containers/dialogs/TestDialog';
import { ProfileSidebar } from '~/containers/sidebars/ProfileSidebar';
import { TagSidebar } from '~/containers/sidebars/TagSidebar';

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
