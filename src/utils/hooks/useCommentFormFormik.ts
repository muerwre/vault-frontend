import { IComment, INode } from '~/redux/types';
import { useCallback, useEffect, useRef } from 'react';
import { FormikHelpers, useFormik, useFormikContext } from 'formik';
import { array, object, string } from 'yup';
import { FileUploader } from '~/utils/hooks/fileUploader';
import { useDispatch } from 'react-redux';
import { nodePostLocalComment } from '~/redux/node/actions';

const validationSchema = object().shape({
  text: string(),
  files: array(),
});

const onSuccess = ({ resetForm, setStatus, setSubmitting }: FormikHelpers<IComment>) => (
  e?: string
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
  stopEditing?: () => void
) => {
  const dispatch = useDispatch();
  const { current: initialValues } = useRef(values);

  const onSubmit = useCallback(
    (values: IComment, helpers: FormikHelpers<IComment>) => {
      helpers.setSubmitting(true);
      dispatch(
        nodePostLocalComment(
          nodeId,
          {
            ...values,
            files: uploader.files,
          },
          onSuccess(helpers)
        )
      );
    },
    [dispatch, nodeId, uploader.files]
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
  }, [formik.values.text]);

  return formik;
};

export const useCommentFormContext = () => useFormikContext<IComment>();
