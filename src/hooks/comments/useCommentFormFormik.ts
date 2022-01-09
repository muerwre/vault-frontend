import { IComment, INode } from '~/types';
import { useCallback, useEffect, useRef } from 'react';
import { FormikHelpers, useFormik, useFormikContext } from 'formik';
import { array, object, string } from 'yup';
import { showErrorToast } from '~/utils/errors/showToast';
import { hasPath, path } from 'ramda';
import { Uploader } from '~/utils/context/UploaderContextProvider';

const validationSchema = object().shape({
  text: string(),
  files: array(),
});

const onSuccess = ({ resetForm, setSubmitting, setErrors }: FormikHelpers<IComment>) => (
  error?: unknown
) => {
  setSubmitting(false);

  if (hasPath(['response', 'data', 'error'], error)) {
    const message = path(['response', 'data', 'error'], error) as string;
    setErrors({ text: message });
    showErrorToast(error);
    return;
  }

  if (resetForm) {
    resetForm();
  }
};

export const useCommentFormFormik = (
  values: IComment,
  nodeId: INode['id'],
  uploader: Uploader,
  sendData: (data: IComment) => Promise<unknown>,
  stopEditing?: () => void
) => {
  const { current: initialValues } = useRef(values);

  const onSubmit = useCallback(
    async (values: IComment, helpers: FormikHelpers<IComment>) => {
      try {
        helpers.setSubmitting(true);
        await sendData({ ...values, files: uploader.files });
        onSuccess(helpers)();
      } catch (error) {
        onSuccess(helpers)(error);
      }
    },
    [sendData, uploader.files]
  );

  const onReset = useCallback(() => {
    uploader.setFiles([]);
    if (stopEditing) stopEditing();
  }, [stopEditing, uploader]);

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
