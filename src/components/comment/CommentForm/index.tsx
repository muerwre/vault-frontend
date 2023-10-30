import { FC, useCallback, useState } from 'react';

import { FormikProvider } from 'formik';
import { observer } from 'mobx-react-lite';

import { CommentFormAttachButtons } from '~/components/comment/CommentFormAttachButtons';
import { CommentFormAttaches } from '~/components/comment/CommentFormAttaches';
import { CommentFormFormatButtons } from '~/components/comment/CommentFormFormatButtons';
import { LocalCommentFormTextarea } from '~/components/comment/LocalCommentFormTextarea';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import { ERROR_LITERAL } from '~/constants/errors';
import { EMPTY_COMMENT } from '~/constants/node';
import { useCommentFormFormik } from '~/hooks/comments/useCommentFormFormik';
import { useInputPasteUpload } from '~/hooks/dom/useInputPasteUpload';
import { IComment } from '~/types';
import {
  useUploaderContext,
} from '~/utils/context/UploaderContextProvider';

import styles from './styles.module.scss';

interface IProps {
  comment?: IComment;
  allowUploads?: boolean;

  saveComment: (data: IComment) => Promise<IComment | undefined>;
  onCancelEdit?: () => void;
}

const CommentForm: FC<IProps> = observer(
  ({ comment, allowUploads, saveComment, onCancelEdit }) => {
    const [textarea, setTextArea] = useState<HTMLTextAreaElement | null>(null);
    const uploader = useUploaderContext();

    const formik = useCommentFormFormik(
      comment || EMPTY_COMMENT,
      uploader.files,
      uploader.setFiles,
      saveComment,
      onCancelEdit,
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
    const onPaste = useInputPasteUpload(uploader.uploadFiles);

    return (
      <form onSubmit={formik.handleSubmit} className={styles.wrap}>
        <FormikProvider value={formik}>
          <div className={styles.input}>
            <LocalCommentFormTextarea onPaste={onPaste} ref={setTextArea} />

            {!!error && (
              <div className={styles.error} onClick={clearError}>
                {ERROR_LITERAL[error] || error}
              </div>
            )}
          </div>

          {allowUploads && <CommentFormAttaches />}

          <div className={styles.buttons}>
            {allowUploads && (
              <div className={styles.button_column}>
                <CommentFormAttachButtons onUpload={uploader.uploadFiles} />
              </div>
            )}

            <div className={styles.button_column}>
              {!!textarea && (
                <CommentFormFormatButtons
                  element={textarea}
                  handler={formik.handleChange('text')}
                />
              )}
            </div>

            <Filler />

            <div className={styles.button_column}>
              {isEditing && (
                <Button
                  size="small"
                  color="link"
                  type="button"
                  onClick={onCancelEdit}
                >
                  Отмена
                </Button>
              )}

              <Button
                type="submit"
                size="small"
                color="gray"
                iconRight={!isEditing ? 'enter' : 'check'}
                disabled={isLoading}
                loading={isLoading}
              >
                {!isEditing ? 'Сказать' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </FormikProvider>
      </form>
    );
  },
);

export { CommentForm };
