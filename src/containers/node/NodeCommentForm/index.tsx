import { FC, useCallback } from 'react';

import { observer } from 'mobx-react-lite';

import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { Dialog } from '~/constants/modal';
import { UploadSubject, UploadTarget } from '~/constants/uploads';
import { CommentForm } from '~/containers/comments/CommentForm';
import { CommentWrapper } from '~/containers/comments/CommentWrapper';
import { useAuth } from '~/hooks/auth/useAuth';
import { useUploader } from '~/hooks/data/useUploader';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { IComment } from '~/types';
import { UploaderContextProvider } from '~/utils/context/UploaderContextProvider';

export interface Props {
  saveComment: (comment: IComment) => Promise<IComment | undefined>;
}

const NodeCommentForm: FC<Props> = observer(({ saveComment }) => {
  const { user, isUser } = useAuth();
  const showRegisterDialog = useShowModal(Dialog.Register);

  const uploader = useUploader(UploadSubject.Comment, UploadTarget.Comments);
  const onCommentSave = useCallback(
    async (comment: IComment) => {
      if (!isUser) {
        showRegisterDialog({});
        return;
      }

      return saveComment(comment);
    },
    [isUser, showRegisterDialog, saveComment],
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
});

export { NodeCommentForm };
