import { useCallback } from 'react';

import { FormikConfig, useFormik } from 'formik';
import { Asserts, object, string } from 'yup';

import { ERRORS } from '~/constants/errors';
import { getValidationErrors } from '~/utils/errors/getValidationErrors';
import { showErrorToast } from '~/utils/errors/showToast';

const validationSchema = object({
  username: string().required(ERRORS.REQUIRED),
  password: string()
    .required(ERRORS.REQUIRED)
    .min(6, ERRORS.PASSWORD_IS_SHORT),
});

type SocialRegisterData = Asserts<typeof validationSchema>;

export const useSocialRegisterForm = (
  token: string,
  fetcher: (props: {
    token: string;
    username: string;
    password: string;
  }) => Promise<{ token: string }>,
  onSuccess: (token: string) => void
) => {
  const onSubmit = useCallback<FormikConfig<SocialRegisterData>['onSubmit']>(
    async (values, { setErrors }) => {
      try {
        const result = await fetcher({
          token,
          username: values.username,
          password: values.password || '',
        });
        onSuccess(result.token);
      } catch (error) {
        showErrorToast(error);

        const validationErrors = getValidationErrors(error);
        if (validationErrors) {
          setErrors(validationErrors);
        }
      }
    },
    [token, onSuccess, fetcher]
  );

  return useFormik<SocialRegisterData>({
    validationSchema,
    onSubmit,
    initialValues: {
      username: '',
      password: '',
    },
  });
};
