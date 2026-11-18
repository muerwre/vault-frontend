import { FC } from 'react';

import { apiLoginWithSocial } from '~/api/auth';
import { RegisterCredentialsDialog } from '~/containers/auth/RegisterCredentialsDialog';
import { DialogComponentProps } from '~/types/modal';

type LoginSocialRegisterDialogProps = DialogComponentProps & { token: string };

/**
 * Signup for an unknown OAuth account. Only reachable while the backend's
 * social registration is on; users normally register by email.
 */
const LoginSocialRegisterDialog: FC<LoginSocialRegisterDialogProps> = ({
  onRequestClose,
  token,
}) => (
  <RegisterCredentialsDialog
    onRequestClose={onRequestClose}
    token={token}
    submit={apiLoginWithSocial}
  />
);

export { LoginSocialRegisterDialog };
