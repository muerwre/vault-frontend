import { FC, PropsWithChildren, useCallback, useRef } from 'react';

import {
  FormikConfig,
  useFormik,
  FormikProvider,
  useFormikContext,
} from 'formik';
import { array, Asserts, object, string } from 'yup';

import { ApiUpdateUserRequest } from '~/api/auth/types';
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
  links: array(string().default('')).default([]),
  email: string().default(''),
  password: string().optional(),
});

export type ProfileFormData = Asserts<typeof validationSchema>;

export const useSettingsForm = (
  values: ProfileFormData,
  submitter: (data: ApiUpdateUserRequest['user']) => Promise<IUser>,
  onSaved?: (user: IUser) => void,
) => {
  const initialValues = useRef(values).current;

  const onSubmit = useCallback<FormikConfig<ProfileFormData>['onSubmit']>(
    async (values, { setErrors, setValues }) => {
      try {
        // Only the fields this form edits: the values start from the whole
        // user, and echoing back the rest (such as an unset `about_display`)
        // would be refused. `email` is read-only and goes back unchanged,
        // which the backend accepts; any other value it refuses.
        const fields = {
          username: values.username,
          fullname: values.fullname,
          description: values.description,
          links: values.links,
          email: values.email,
          password: values.password?.length ? values.password : undefined,
          new_password: values.newPassword?.length
            ? values.newPassword
            : undefined,
        };

        const result = await submitter(fields);

        setValues({
          ...result,
          links: result.links ?? [],
          password: '',
          newPassword: '',
        });
        showToastSuccess(getRandomPhrase('SUCCESS'));
        onSaved?.(result);
      } catch (error) {
        showErrorToast(error);

        const validationErrors = getValidationErrors(error);
        if (validationErrors) {
          setErrors(validationErrors);
        }
      }
    },
    [submitter, onSaved],
  );

  return useFormik({
    initialValues,
    onSubmit,
    validationSchema,
  });
};

interface SettingsProviderProps {
  /** Runs after a successful save, with the saved user. */
  onSaved?: (user: IUser) => void;
}

export const SettingsProvider: FC<PropsWithChildren<SettingsProviderProps>> = ({
  children,
  onSaved,
}) => {
  const { user } = useUser();
  const { save } = usePatchUser();

  const formik = useSettingsForm(
    { ...user, links: user.links ?? [], password: '', newPassword: '' },
    save,
    onSaved,
  );

  return <FormikProvider value={formik}>{children}</FormikProvider>;
};

export const useSettings = () => useFormikContext<ProfileFormData>();
