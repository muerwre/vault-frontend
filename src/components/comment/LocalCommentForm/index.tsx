import React, { FC, useState } from 'react';
import { CommentFormValues, useCommentFormFormik } from '~/utils/hooks/useCommentFormFormik';
import { FormikProvider } from 'formik';
import { LocalCommentFormTextarea } from '~/components/comment/LocalCommentFormTextarea';

interface IProps {}

const initialValues: CommentFormValues = {
  text: '',
  images: [],
  songs: [],
};

const LocalCommentForm: FC<IProps> = () => {
  const [textarea, setTextarea] = useState<HTMLTextAreaElement>();
  const { formik, isLoading } = useCommentFormFormik(initialValues, console.log);

  return (
    <FormikProvider value={formik}>
      <LocalCommentFormTextarea isLoading={isLoading} setRef={setTextarea} />
    </FormikProvider>
  );
};

export { LocalCommentForm };
