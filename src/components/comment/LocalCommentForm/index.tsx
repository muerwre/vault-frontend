import React, { FC, useCallback, useState } from 'react';
import { useCommentFormFormik } from '~/utils/hooks/useCommentFormFormik';
import { FormikProvider } from 'formik';
import { LocalCommentFormTextarea } from '~/components/comment/LocalCommentFormTextarea';
import { Button } from '~/components/input/Button';
import { FileUploaderProvider, useFileUploader } from '~/utils/hooks/fileUploader';
import { UPLOAD_SUBJECTS, UPLOAD_TARGETS } from '~/redux/uploads/constants';
import { CommentFormAttachButtons } from '~/components/comment/CommentFormAttachButtons';
import { CommentFormFormatButtons } from '~/components/comment/CommentFormFormatButtons';
import { LocalCommentFormAttaches } from '~/components/comment/LocalCommentFormAttaches';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { IComment, INode } from '~/redux/types';
import { EMPTY_COMMENT } from '~/redux/node/constants';
import { CommentFormDropzone } from '~/components/comment/CommentFormDropzone';
import styles from './styles.module.scss';
import { ERROR_LITERAL } from '~/constants/errors';
import { Group } from '~/components/containers/Group';

interface IProps {
  comment?: IComment;
  nodeId: INode['id'];
  onCancelEdit?: () => void;
}

const LocalCommentForm: FC<IProps> = ({ comment, nodeId, onCancelEdit }) => {
  const [textarea, setTextarea] = useState<HTMLTextAreaElement>();
  const uploader = useFileUploader(
    UPLOAD_SUBJECTS.COMMENT,
    UPLOAD_TARGETS.COMMENTS,
    comment?.files
  );
  const formik = useCommentFormFormik(comment || EMPTY_COMMENT, nodeId, uploader, onCancelEdit);
  const isLoading = formik.isSubmitting || uploader.isUploading;
  const isEditing = !!comment?.id;

  const clearError = useCallback(() => {
    if (formik.status) {
      formik.setStatus('');
    }

    if (formik.errors.text) {
      formik.setErrors({
        ...formik.errors,
        text: '',
      });
    }
  }, [formik]);

  const error = formik.status || formik.errors.text;

  return (
    <CommentFormDropzone onUpload={uploader.uploadFiles}>
      <form onSubmit={formik.handleSubmit} className={styles.wrap}>
        <FormikProvider value={formik}>
          <FileUploaderProvider value={uploader}>
            <div className={styles.input}>
              <LocalCommentFormTextarea setRef={setTextarea} />

              {!!error && (
                <div className={styles.error} onClick={clearError}>
                  {ERROR_LITERAL[error] || error}
                </div>
              )}
            </div>

            <LocalCommentFormAttaches />

            <Group horizontal className={styles.buttons}>
              <CommentFormAttachButtons onUpload={uploader.uploadFiles} />
              <CommentFormFormatButtons element={textarea} handler={formik.handleChange('text')} />

              {isLoading && <LoaderCircle size={20} />}

              {isEditing && (
                <Button size="small" color="link" type="button" onClick={onCancelEdit}>
                  Отмена
                </Button>
              )}

              <Button
                type="submit"
                size="small"
                color="gray"
                iconRight={!isEditing ? 'enter' : 'check'}
                disabled={isLoading}
              >
                {!isEditing ? 'Сказать' : 'Сохранить'}
              </Button>
            </Group>
          </FileUploaderProvider>
        </FormikProvider>
      </form>
    </CommentFormDropzone>
  );
};

export { LocalCommentForm };
