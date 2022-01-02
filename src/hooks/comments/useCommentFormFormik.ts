import { IComment, INode } from '~/redux/types';
import { useCallback, useEffect, useRef } from 'react';
import { FormikHelpers, useFormik, useFormikContext } from 'formik';
import { array, object, string } from 'yup';
import { FileUploader } from '~/hooks/data/useFileUploader';
import { showErrorToast } from '~/utils/errors/showToast';
import { hasPath, path } from 'ramda';

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
  uploader: FileUploader,
  sendData: (data: IComment) => Promise<unknown>,
  stopEditing?: () => void
) => {
  const { current: initialValues } = useRef(values);

  const onSubmit = useCallback(
    async (values: IComment, helpers: FormikHelpers<IComment>) => {
      try {
        helpers.setSubmitting(true);
        await sendData(values);
        onSuccess(helpers)();
      } catch (error) {
        console.log('error', error);
        onSuccess(helpers)(error);
      }
    },
    [sendData]
  );

  const onReset = useCallback(() => {
    uploader.setFiles([]);

    if (stopEditing) stopEditing();
  }, [uploader, stopEditing]);

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
