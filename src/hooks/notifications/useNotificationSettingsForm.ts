import { useCallback } from 'react';

import { FormikConfig, useFormik } from 'formik';
import { Asserts, boolean, object } from 'yup';

import { showErrorToast } from '~/utils/errors/showToast';

import { useFormAutoSubmit } from '../useFormAutosubmit';

const validationSchema = object({
  enabled: boolean().default(false),
  flow: boolean().default(false),
  boris: boolean().default(false),
  comments: boolean().default(false),
  sendTelegram: boolean().default(false),
  showIndicator: boolean().default(false),
});

type Values = Asserts<typeof validationSchema>;

export const useNotificationSettingsForm = (
  initialValues: Values,
  submit: (val: Values) => void,
) => {
  const onSubmit = useCallback<FormikConfig<Values>['onSubmit']>(
    async (values, { setSubmitting }) => {
      try {
        await submit(values);
      } catch (error) {
        showErrorToast(error);
      } finally {
        setSubmitting(false);
      }
    },
    [submit],
  );

  const formik = useFormik<Values>({
    initialValues,
    validationSchema,
    onSubmit,
  });

  useFormAutoSubmit(formik.values, formik.handleSubmit);

  return formik;
};
