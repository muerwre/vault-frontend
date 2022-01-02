import React, { FC, useCallback, useState } from 'react';
import { useCommentFormFormik } from '~/hooks/comments/useCommentFormFormik';
import { FormikProvider } from 'formik';
import { LocalCommentFormTextarea } from '~/components/comment/LocalCommentFormTextarea';
import { Button } from '~/components/input/Button';
import { FileUploaderProvider, useFileUploader } from '~/hooks/data/useFileUploader';
import { UPLOAD_SUBJECTS, UPLOAD_TARGETS } from '~/redux/uploads/constants';
import { CommentFormAttachButtons } from '~/components/comment/CommentFormAttachButtons';
import { CommentFormFormatButtons } from '~/components/comment/CommentFormFormatButtons';
import { CommentFormAttaches } from '~/components/comment/CommentFormAttaches';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { IComment, INode } from '~/redux/types';
import { EMPTY_COMMENT } from '~/constants/node';
import { UploadDropzone } from '~/components/upload/UploadDropzone';
import styles from './styles.module.scss';
import { ERROR_LITERAL } from '~/constants/errors';
import { useInputPasteUpload } from '~/hooks/dom/useInputPasteUpload';
import { Filler } from '~/components/containers/Filler';

interface IProps {
  comment?: IComment;
  nodeId: INode['id'];
  saveComment: (data: IComment) => Promise<unknown>;
  onCancelEdit?: () => void;
}

const CommentForm: FC<IProps> = ({ comment, nodeId, saveComment, onCancelEdit }) => {
  const [textarea, setTextarea] = useState<HTMLTextAreaElement>();
  const uploader = useFileUploader(
    UPLOAD_SUBJECTS.COMMENT,
    UPLOAD_TARGETS.COMMENTS,
    comment?.files
  );
  const formik = useCommentFormFormik(
    comment || EMPTY_COMMENT,
    nodeId,
    uploader,
    saveComment,
    onCancelEdit
  );
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
  useInputPasteUpload(textarea, uploader.uploadFiles);

  return (
    <UploadDropzone onUpload={uploader.uploadFiles}>
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

            <CommentFormAttaches />

            <div className={styles.buttons}>
              <div className={styles.button_column}>
                <CommentFormAttachButtons onUpload={uploader.uploadFiles} />
              </div>

              <Filler />

              <div className={styles.button_column}>
                {!!textarea && (
                  <CommentFormFormatButtons
                    element={textarea}
                    handler={formik.handleChange('text')}
                  />
                )}
              </div>

              <div className={styles.button_column}>
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
              </div>
            </div>
          </FileUploaderProvider>
        </FormikProvider>
      </form>
    </UploadDropzone>
  );
};

export { CommentForm };
