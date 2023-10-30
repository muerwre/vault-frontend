import { FC, useCallback } from 'react';

import { CommentForm } from '~/components/comment/CommentForm';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { EMPTY_USER } from '~/constants/auth';
import { Dialog } from '~/constants/modal';
import { UploadSubject, UploadTarget } from '~/constants/uploads';
import { useAuth } from '~/hooks/auth/useAuth';
import { useUploader } from '~/hooks/data/useUploader';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { IComment } from '~/types';
import { UploaderContextProvider } from '~/utils/context/UploaderContextProvider';

export interface Props {
  saveComment: (comment: IComment) => Promise<IComment | undefined>;
}

const NodeCommentForm: FC<Props> = ({ saveComment }) => {
  const { user, isUser } = useAuth();
  const showLoginDialog = useShowModal(Dialog.Login);

  const uploader = useUploader(UploadSubject.Comment, UploadTarget.Comments);
  const onCommentSave = useCallback(
    async (comment: IComment) => {
      if (!isUser) {
        showLoginDialog({});
        return;
      }

      return saveComment(comment);
    },
    [isUser, showLoginDialog, saveComment],
  );

  return (
    <UploadDropzone onUpload={uploader.uploadFiles}>
      <UploaderContextProvider value={uploader}>
        <CommentWrapper user={isUser ? user : undefined} isForm>
          <CommentForm saveComment={onCommentSave} allowUploads={isUser} />
        </CommentWrapper>
      </UploaderContextProvider>
    </UploadDropzone>
  );
};

export { NodeCommentForm };
