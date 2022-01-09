import { IUser } from '~/types/auth';
import { Asserts, object, string } from 'yup';
import { ERRORS } from '~/constants/errors';
import { FormikConfig, useFormik } from 'formik';
import { useCallback, useRef } from 'react';
import { showToastSuccess } from '~/utils/toast';
import { getRandomPhrase } from '~/constants/phrases';
import { showErrorToast } from '~/utils/errors/showToast';
import { getValidationErrors } from '~/utils/errors/getValidationErrors';

const validationSchema = object({
  username: string()
    .default('')
    .required(ERRORS.REQUIRED),
  fullname: string().default(''),
  newPassword: string().optional(),
  description: string().default(''),
  email: string()
    .default('')
    .email(ERRORS.NOT_AN_EMAIL),
  password: string().optional(),
});

export type ProfileFormData = Asserts<typeof validationSchema>;

export const useProfileForm = (
  values: ProfileFormData,
  submitter: (data: ProfileFormData) => Promise<IUser>
) => {
  const initialValues = useRef(values).current;

  const onSubmit = useCallback<FormikConfig<ProfileFormData>['onSubmit']>(
    async (values, { setErrors, setValues }) => {
      try {
        const fields = {
          ...values,
          password: values.password?.length ? values.password : undefined,
          new_password: values.newPassword?.length ? values.newPassword : undefined,
        };

        const result = await submitter(fields);

        setValues({ ...result, password: '', newPassword: '' });
        showToastSuccess(getRandomPhrase('SUCCESS'));
      } catch (error) {
        showErrorToast(error);

        const validationErrors = getValidationErrors(error);
        if (validationErrors) {
          setErrors(validationErrors);
        }
      }
    },
    [submitter]
  );

  return useFormik({
    initialValues,
    onSubmit,
    validationSchema,
  });
};
