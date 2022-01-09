import { Asserts, object, string } from 'yup';
import { ERRORS } from '~/constants/errors';
import { FormikConfig, useFormik } from 'formik';
import { useCallback } from 'react';
import { showErrorToast } from '~/utils/errors/showToast';
import { getValidationErrors } from '~/utils/errors/getValidationErrors';

const validationSchema = object({
  field: string().required(ERRORS.REQUIRED),
});

type RestoreRequestData = Asserts<typeof validationSchema>;

export const useRestoreRequestForm = (
  fetcher: (field: string) => Promise<unknown>,
  onSuccess: () => void
) => {
  const onSubmit = useCallback<FormikConfig<RestoreRequestData>['onSubmit']>(
    async (values, { setErrors }) => {
      try {
        await fetcher(values.field);
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
    onSubmit,
    validationSchema,
    initialValues: { field: '' },
  });
};
