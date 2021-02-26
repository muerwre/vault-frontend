import React, { FC, useState } from 'react';
import { CommentFormValues, useCommentFormFormik } from '~/utils/hooks/useCommentFormFormik';
import { FormikProvider } from 'formik';
import { LocalCommentFormTextarea } from '~/components/comment/LocalCommentFormTextarea';
import { Button } from '~/components/input/Button';

interface IProps {}

const initialValues: CommentFormValues = {
  text: '',
  images: [],
  songs: [],
};

const LocalCommentForm: FC<IProps> = () => {
  const [textarea, setTextarea] = useState<HTMLTextAreaElement>();
  const { formik } = useCommentFormFormik(initialValues);

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormikProvider value={formik}>
        <LocalCommentFormTextarea isLoading={formik.isSubmitting} setRef={setTextarea} />
        {formik.isSubmitting && <div>LOADING</div>}
        {!!formik.status && <div>error: {formik.status}</div>}
        <Button size="small" disabled={formik.isSubmitting}>
          SEND
        </Button>
      </FormikProvider>
    </form>
  );
};

export { LocalCommentForm };
