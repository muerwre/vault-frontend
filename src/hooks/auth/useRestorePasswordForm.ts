import { useCallback } from 'react';

import { FormikConfig, useFormik } from 'formik';
import { Asserts, object, string } from 'yup';

import { ERRORS } from '~/constants/errors';
import { useAuthStore } from '~/store/auth/useAuthStore';
import { IUser } from '~/types/auth';
import { getValidationErrors } from '~/utils/errors/getValidationErrors';
import { showErrorToast } from '~/utils/errors/showToast';

const validationSchema = object({
  newPassword: string()
    .required(ERRORS.REQUIRED)
    .min(6, ERRORS.PASSWORD_IS_SHORT),
  newPasswordAgain: string()
    .required(ERRORS.REQUIRED)
    .test(
      'sameAsPassword',
      'Должен совпадать с паролем',
      (val, ctx) => val === ctx.parent.newPassword
    ),
});

export type RestorePasswordData = Asserts<typeof validationSchema>;

export const useRestorePasswordForm = (
  code: string,
  fetcher: (props: { code: string; password: string }) => Promise<{ token: string; user: IUser }>,
  onSuccess: () => void
) => {
  const auth = useAuthStore();

  const onSubmit = useCallback<FormikConfig<RestorePasswordData>['onSubmit']>(
    async (values, { setErrors }) => {
      try {
        const { token, user } = await fetcher({ password: values.newPassword, code });
        auth.setUser(user);
        auth.setToken(token);
        onSuccess();
      } catch (error) {
        showErrorToast(error);

        const validationErrors = getValidationErrors(error);
        if (validationErrors) {
          setErrors(validationErrors);
        }
      }
    },
    [onSuccess, fetcher, code, auth]
  );

  return useFormik<RestorePasswordData>({
    onSubmit,
    validationSchema,
    initialValues: { newPassword: '', newPasswordAgain: '' },
  });
};
