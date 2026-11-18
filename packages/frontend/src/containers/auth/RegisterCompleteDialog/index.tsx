import { FC, useCallback } from 'react';

import useSWR from 'swr';

import {
  apiCheckRegistrationCode,
  apiCompleteRegistration,
} from '~/api/registration';
import { API } from '~/constants/api';
import { RegisterCredentialsDialog } from '~/containers/auth/RegisterCredentialsDialog';
import { RestoreInvalidCode } from '~/containers/auth/RestorePasswordDialog/components/RestoreInvalidCode';
import { DialogComponentProps } from '~/types/modal';
import { getErrorMessage } from '~/utils/errors/getErrorMessage';

type RegisterCompleteDialogProps = DialogComponentProps & { code: string };

/** Opened by the mailed registration link: picks a username and password. */
const RegisterCompleteDialog: FC<RegisterCompleteDialogProps> = ({
  onRequestClose,
  code,
}) => {
  const { data, error } = useSWR(
    API.REGISTRATION.CODE(code),
    () => apiCheckRegistrationCode(code),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  const submit = useCallback(
    ({ username, password }: { username: string; password: string }) =>
      apiCompleteRegistration({ code, username, password }),
    [code],
  );

  return (
    <RegisterCredentialsDialog
      onRequestClose={onRequestClose}
      token={code}
      submit={submit}
      isLoading={!data && !error}
      overlay={
        error ? (
          <RestoreInvalidCode
            onClose={onRequestClose}
            error={getErrorMessage(error) || 'Ссылка недействительна'}
          />
        ) : undefined
      }
    />
  );
};

export { RegisterCompleteDialog };
