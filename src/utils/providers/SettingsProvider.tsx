import { FC, PropsWithChildren, useCallback, useRef } from 'react';

import {
  FormikConfig,
  useFormik,
  FormikProvider,
  useFormikContext,
} from 'formik';
import { Asserts, object, string } from 'yup';

import { ERRORS } from '~/constants/errors';
import { getRandomPhrase } from '~/constants/phrases';
import { usePatchUser } from '~/hooks/auth/usePatchUser';
import { useUser } from '~/hooks/auth/useUser';
import { IUser } from '~/types/auth';
import { getValidationErrors } from '~/utils/errors/getValidationErrors';
import { showErrorToast } from '~/utils/errors/showToast';
import { showToastSuccess } from '~/utils/toast';

const validationSchema = object({
  username: string().default('').required(ERRORS.REQUIRED),
  fullname: string().default(''),
  newPassword: string().optional(),
  description: string().default(''),
  email: string().default('').email(ERRORS.NOT_AN_EMAIL),
  password: string().optional(),
});

export type ProfileFormData = Asserts<typeof validationSchema>;

export const useSettingsForm = (
  values: ProfileFormData,
  submitter: (data: ProfileFormData) => Promise<IUser>,
) => {
  const initialValues = useRef(values).current;

  const onSubmit = useCallback<FormikConfig<ProfileFormData>['onSubmit']>(
    async (values, { setErrors, setValues }) => {
      try {
        const fields = {
          ...values,
          password: values.password?.length ? values.password : undefined,
          new_password: values.newPassword?.length
            ? values.newPassword
            : undefined,
        };

        const result = await submitter(fields);

        setValues({ ...result, password: '', newPassword: '' });
        showToastSuccess(getRandomPhrase('SUCCESS'));
      } catch (error) {
        showErrorToast(error);

        const validationErrors = getValidationErrors(error);
        if (validationErrors) {
          console.log(validationErrors);
          setErrors(validationErrors);
        }
      }
    },
    [submitter],
  );

  return useFormik({
    initialValues,
    onSubmit,
    validationSchema,
  });
};

export const SettingsProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { user } = useUser();
  const { save } = usePatchUser();

  const formik = useSettingsForm(
    { ...user, password: '', newPassword: '' },
    save,
  );

  return <FormikProvider value={formik}>{children}</FormikProvider>;
};

export const useSettings = () => useFormikContext<ProfileFormData>();
