/**
 * Dialog ids. Kept apart from the dialog components, which import much of
 * the app: code that only opens a dialog must not pull them all in, or it
 * runs into import cycles.
 */
export enum Dialog {
  Login = 'Login',
  Register = 'Register',
  RegisterRequest = 'RegisterRequest',
  RegisterComplete = 'RegisterComplete',
  LoginSocialRegister = 'LoginSocialRegister',
  Loading = 'Loading',
  RestoreRequest = 'RestoreRequest',
  RestorePassword = 'RestorePassword',
  Test = 'Test',
  Photoswipe = 'Photoswipe',
  CreateNode = 'CreateNode',
  EditNode = 'EditNode',
  TelegramAttach = 'TelegramAttach',
  GoogleLoginDisabled = 'GoogleLoginDisabled',
}

/** Sign-in and signup dialogs: they share the login scene while switching. */
export const AUTH_DIALOGS: readonly Dialog[] = [
  Dialog.Login,
  Dialog.Register,
  Dialog.RegisterRequest,
  Dialog.RegisterComplete,
  Dialog.LoginSocialRegister,
  Dialog.RestoreRequest,
  Dialog.RestorePassword,
  Dialog.GoogleLoginDisabled,
];

/**
 * Dialogs for someone not logged in: signing in, signing up, asking to reset a
 * password. They never open for a logged-in user, whoever asks for them.
 */
export const GUEST_DIALOGS: readonly Dialog[] = [
  Dialog.Login,
  Dialog.Register,
  Dialog.RegisterRequest,
  Dialog.LoginSocialRegister,
  Dialog.RestoreRequest,
  Dialog.GoogleLoginDisabled,
];
