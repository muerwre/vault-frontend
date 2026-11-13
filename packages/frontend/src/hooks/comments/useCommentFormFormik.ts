import { useCallback, useEffect, useRef } from 'react';

import { FormikHelpers, useFormik, useFormikContext } from 'formik';
import { array, object, string } from 'yup';

import { IComment, IFile } from '~/types';
import { getErrorMessage } from '~/utils/errors/getErrorMessage';
import { showErrorToast } from '~/utils/errors/showToast';

const validationSchema = object().shape({
  text: string(),
  files: array(),
});

const onSuccess =
  ({ resetForm, setSubmitting, setErrors }: FormikHelpers<IComment>) =>
  (error?: unknown) => {
    setSubmitting(false);
    const message = getErrorMessage(error);

    if (message) {
      setErrors({ text: message });
      showErrorToast(error);
      return;
    }

    if (resetForm) {
      resetForm();
    }
  };

export const useCommentFormFormik = (
  comment: IComment,
  files: IFile[],
  setFiles: (file: IFile[]) => void,
  sendData: (data: IComment) => Promise<IComment | undefined>,
  stopEditing?: () => void,
) => {
  const { current: initialValues } = useRef(comment);

  const onSubmit = useCallback(
    async (values: IComment, helpers: FormikHelpers<IComment>) => {
      try {
        helpers.setSubmitting(true);

        const comment = await sendData({ ...values, files });

        if (comment) {
          onSuccess(helpers)();
        }
      } catch (error) {
        onSuccess(helpers)(error);
      }
    },
    [sendData, files],
  );

  const onReset = useCallback(() => {
    setFiles([]);
    if (stopEditing) stopEditing();
  }, [stopEditing, setFiles]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    initialStatus: '',
    onReset,
    validateOnChange: true,
  });

  useEffect(() => {
    if (formik.status) {
      formik.setStatus('');
    }
  }, [formik, formik.values.text]);

  return formik;
};

export const useCommentFormContext = () => useFormikContext<IComment>();
