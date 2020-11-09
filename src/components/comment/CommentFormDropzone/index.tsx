import React, { FC } from 'react';
import { COMMENT_FILE_TYPES } from '~/redux/uploads/constants';
import { useDropZone } from '~/utils/hooks';

interface IProps {
  onUpload: (files: File[]) => void;
}

const CommentFormDropzone: FC<IProps> = ({ children, onUpload }) => {
  const onDrop = useDropZone(onUpload, COMMENT_FILE_TYPES);
  return <div onDropCapture={onDrop}>{children}</div>;
};

export { CommentFormDropzone };
