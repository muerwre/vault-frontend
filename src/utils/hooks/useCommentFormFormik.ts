import { IComment, INode } from '~/redux/types';
import { useCallback, useRef } from 'react';
import { FormikHelpers, useFormik, useFormikContext } from 'formik';
import { array, object, string } from 'yup';
import { FileUploader } from '~/utils/hooks/fileUploader';

const validationSchema = object().shape({
  text: string(),
  files: array(),
});

const submitComment = (
  id: INode['id'],
  values: IComment,
  isBefore: boolean,
  callback: (e?: string) => void
) => {
  console.log('Submitting', id, values);
  new Promise(resolve => setTimeout(resolve, 500)).then(() => callback());
};

const onSuccess = ({ resetForm, setStatus, setSubmitting }: FormikHelpers<IComment>) => (
  e: string
) => {
  setSubmitting(false);

  if (e) {
    setStatus(e);
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
  stopEditing?: () => void,
  isBefore: boolean = false
) => {
  const { current: initialValues } = useRef(values);

  const onSubmit = useCallback(
    (values: IComment, helpers: FormikHelpers<IComment>) => {
      helpers.setSubmitting(true);
      submitComment(
        nodeId,
        {
          ...values,
          files: uploader.files,
        },
        isBefore,
        onSuccess(helpers)
      );
    },
    [isBefore, nodeId, uploader.files]
  );

  const onReset = useCallback(() => {
    uploader.setFiles([]);

    if (stopEditing) stopEditing();
  }, [uploader, stopEditing]);

  return useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    initialStatus: '',
    onReset,
  });
};

export const useCommentFormContext = () => useFormikContext<IComment>();
