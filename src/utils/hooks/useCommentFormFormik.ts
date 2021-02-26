import { IFile } from '~/redux/types';
import { useRef, useState } from 'react';
import { useFormik, useFormikContext } from 'formik';
import { object, string, array } from 'yup';

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

export const useCommentFormFormik = (
  values: CommentFormValues,
  onSubmit: (values: CommentFormValues) => void
) => {
  const { current: initialValues } = useRef(values);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  const [isLoading, setIsLoading] = useState(false);

  return { formik, isLoading };
};

export const useCommentFormContext = () => useFormikContext<CommentFormValues>();
