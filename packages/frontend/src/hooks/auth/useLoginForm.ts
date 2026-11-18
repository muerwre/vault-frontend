import { useCallback } from 'react';

import { FormikConfig, useFormik } from 'formik';
import { Asserts, object, string } from 'yup';

import { ERRORS } from '~/constants/errors';
import { IUser } from '~/types/auth';
import { getValidationErrors } from '~/utils/errors/getValidationErrors';
import { showErrorToast } from '~/utils/errors/showToast';

const validationSchema = object({
  username: string().required(ERRORS.REQUIRED),
  password: string().required(ERRORS.REQUIRED),
});

export type LoginFormData = Asserts<typeof validationSchema>;

export const useLoginForm = (
  fetcher: (username: string, password: string) => Promise<IUser>,
  onSuccess: () => void,
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
    [fetcher, onSuccess],
  );

  const formik = useFormik({
    validationSchema,
    onSubmit,
    // Checked on submit only; typing into a field clears its error.
    validateOnChange: false,
    validateOnBlur: false,
    initialValues: {
      username: '',
      password: '',
    },
  });

  const { setFieldValue, setFieldError } = formik;

  const handleChange = useCallback(
    (field: keyof LoginFormData) => (value: string) => {
      void setFieldValue(field, value, false);
      setFieldError(field, undefined);
    },
    [setFieldValue, setFieldError],
  );

  return { ...formik, handleChange };
};
