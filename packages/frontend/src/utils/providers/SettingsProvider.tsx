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
  info: array(
    object({
      title: string().default(''),
      value: string().default(''),
    }),
  ).default([]),
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
  // what the server last stored, to send only the fields that changed
  const saved = useRef(values);

  const onSubmit = useCallback<FormikConfig<ProfileFormData>['onSubmit']>(
    async (values, { setErrors, setValues }) => {
      try {
        // Only the fields this form edits: the values start from the whole
        // user, and echoing back the rest (such as an unset `about_display`)
        // would be refused. The name and description go only when changed,
        // so one stored before a stricter limit does not block saving the
        // rest. `email` is read-only and goes back unchanged, which the
        // backend accepts; any other value it refuses.
        const changed = <K extends 'fullname' | 'description'>(key: K) =>
          values[key] !== saved.current[key] ? values[key] : undefined;

        const fields = {
          username: values.username,
          fullname: changed('fullname'),
          description: changed('description'),
          info: values.info,
          email: values.email,
          password: values.password?.length ? values.password : undefined,
          new_password: values.newPassword?.length
            ? values.newPassword
            : undefined,
        };

        const result = await submitter(fields);

        saved.current = {
          ...saved.current,
          fullname: result.fullname,
          description: result.description,
        };

        setValues({
          ...result,
          info: result.info ?? [],
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
    { ...user, info: user.info ?? [], password: '', newPassword: '' },
    save,
    onSaved,
  );

  return <FormikProvider value={formik}>{children}</FormikProvider>;
};

export const useSettings = () => useFormikContext<ProfileFormData>();
