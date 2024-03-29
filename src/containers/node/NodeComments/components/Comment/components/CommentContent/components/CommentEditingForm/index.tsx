import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { UploadSubject, UploadTarget } from '~/constants/uploads';
import { CommentForm } from '~/containers/comments/CommentForm';
import { useUploader } from '~/hooks/data/useUploader';
import { IComment, INode } from '~/types';
import { UploaderContextProvider } from '~/utils/context/UploaderContextProvider';

interface CommentEditingFormProps {
  comment: IComment;
  nodeId: INode['id'];
  saveComment: (data: IComment) => Promise<IComment | undefined>;
  onCancelEdit?: () => void;
}

const CommentEditingForm: FC<CommentEditingFormProps> = observer(
  ({ saveComment, comment, onCancelEdit }) => {
    const uploader = useUploader(
      UploadSubject.Comment,
      UploadTarget.Comments,
      comment.files,
    );

    return (
      <UploadDropzone onUpload={uploader.uploadFiles}>
        <UploaderContextProvider value={uploader}>
          <CommentForm
            saveComment={saveComment}
            comment={comment}
            onCancelEdit={onCancelEdit}
            allowUploads
          />
        </UploaderContextProvider>
      </UploadDropzone>
    );
  },
);

export { CommentEditingForm };
