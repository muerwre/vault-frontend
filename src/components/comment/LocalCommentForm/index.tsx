import React, { FC, useState } from 'react';
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

interface IProps {
  comment?: IComment;
  nodeId: INode['id'];
  isBefore?: boolean;
  onCancelEdit?: () => void;
}

const LocalCommentForm: FC<IProps> = ({ comment, nodeId, isBefore, onCancelEdit }) => {
  const [textarea, setTextarea] = useState<HTMLTextAreaElement>();
  const uploader = useFileUploader(UPLOAD_SUBJECTS.COMMENT, UPLOAD_TARGETS.COMMENTS);
  const formik = useCommentFormFormik(
    comment || EMPTY_COMMENT,
    nodeId,
    uploader,
    onCancelEdit,
    isBefore
  );
  const isLoading = formik.isSubmitting || uploader.isUploading;
  const isEditing = !!comment?.id;

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormikProvider value={formik}>
        <FileUploaderProvider value={uploader}>
          <LocalCommentFormTextarea setRef={setTextarea} />

          <CommentFormAttachButtons onUpload={uploader.uploadFiles} />
          <CommentFormFormatButtons element={textarea} handler={formik.handleChange('text')} />
          <LocalCommentFormAttaches />

          {isLoading && <LoaderCircle size={20} />}

          {isEditing && (
            <Button size="small" color="link" type="button" onClick={onCancelEdit}>
              Отмена
            </Button>
          )}

          <Button
            size="small"
            color="gray"
            iconRight={!isEditing ? 'enter' : 'check'}
            disabled={isLoading}
          >
            {!isEditing ? 'Сказать' : 'Сохранить'}
          </Button>
        </FileUploaderProvider>
      </FormikProvider>
    </form>
  );
};

export { LocalCommentForm };
