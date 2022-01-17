import { Asserts, object, string } from 'yup';
import { ERRORS } from '~/constants/errors';
import { useCallback } from 'react';
import { FormikConfig, useFormik } from 'formik';
import { IUser } from '~/types/auth';
import { showToastSuccess } from '~/utils/toast';
import { getRandomPhrase } from '~/constants/phrases';
import { showErrorToast } from '~/utils/errors/showToast';
import { getValidationErrors } from '~/utils/errors/getValidationErrors';

const validationSchema = object({
  username: string().required(ERRORS.REQUIRED),
  password: string().required(ERRORS.REQUIRED),
});

export type LoginFormData = Asserts<typeof validationSchema>;

export const useLoginForm = (
  fetcher: (username: string, password: string) => Promise<IUser>,
  onSuccess: () => void
) => {
  const onSubmit = useCallback<FormikConfig<LoginFormData>['onSubmit']>(
    async (values, { setErrors }) => {
      try {
        await fetcher(values.username, values.password);
        onSuccess();
      } catch (error) {
        showErrorToast(error);

        const validationErrors = getValidationErrors(error);
        if (validationErrors) {
          setErrors(validationErrors);
        }
      }
    },
    [fetcher, onSuccess]
  );

  return useFormik({
    validationSchema,
    onSubmit,
    initialValues: {
      username: '',
      password: '',
    },
  });
};
