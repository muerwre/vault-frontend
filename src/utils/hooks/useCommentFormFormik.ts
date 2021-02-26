import { IComment, IFile } from '~/redux/types';
import { useCallback, useRef } from 'react';
import { FormikHelpers, useFormik, useFormikContext } from 'formik';
import { array, object, string } from 'yup';

export interface CommentFormValues {
  text: string;
  images: IFile[];
  songs: IFile[];
}

const validationSchema = object().shape({
  text: string(),
  images: array(),
  songs: array(),
});

const submitComment = async (
  id: IComment['id'],
  values: CommentFormValues,
  callback: (e: string) => void
) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  callback('wrong');
};

export const useCommentFormFormik = (values: CommentFormValues) => {
  const { current: initialValues } = useRef(values);

  const onSuccess = useCallback(
    ({ resetForm, setStatus, setSubmitting }: FormikHelpers<CommentFormValues>) => (e: string) => {
      setSubmitting(false);

      if (e) {
        setStatus(e);
        return;
      }

      if (resetForm) {
        resetForm();
      }
    },
    []
  );

  const onSubmit = useCallback(
    (values: CommentFormValues, helpers: FormikHelpers<CommentFormValues>) => {
      helpers.setSubmitting(true);
      submitComment(0, values, onSuccess(helpers));
    },
    [values, onSuccess]
  );

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    initialStatus: '',
  });

  return { formik };
};

export const useCommentFormContext = () => useFormikContext<CommentFormValues>();
