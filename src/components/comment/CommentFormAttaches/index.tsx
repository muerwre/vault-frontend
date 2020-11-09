import React, { FC, useCallback } from 'react';
import styles from '~/components/comment/CommentForm/styles.module.scss';
import { SortableImageGrid } from '~/components/editors/SortableImageGrid';
import { SortableAudioGrid } from '~/components/editors/SortableAudioGrid';
import { IComment, IFile } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';
import { SortEnd } from 'react-sortable-hoc';
import assocPath from 'ramda/es/assocPath';
import { moveArrItem } from '~/utils/fn';
import { useDropZone } from '~/utils/hooks';
import { COMMENT_FILE_TYPES } from '~/redux/uploads/constants';

interface IProps {
  images: IFile[];
  audios: IFile[];
  locked_images: IUploadStatus[];
  locked_audios: IUploadStatus[];
  comment: IComment;
  setComment: (data: IComment) => void;
  onUpload: (files: File[]) => void;
}

const CommentFormAttaches: FC<IProps> = ({
  images,
  audios,
  locked_images,
  locked_audios,
  comment,
  setComment,
  onUpload,
}) => {
  const onDrop = useDropZone(onUpload, COMMENT_FILE_TYPES);

  const hasImageAttaches = images.length > 0 || locked_images.length > 0;
  const hasAudioAttaches = audios.length > 0 || locked_audios.length > 0;
  const hasAttaches = hasImageAttaches || hasAudioAttaches;

  const onImageMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      setComment(
        assocPath(
          ['files'],
          [
            ...audios,
            ...(moveArrItem(
              oldIndex,
              newIndex,
              images.filter(file => !!file)
            ) as IFile[]),
          ],
          comment
        )
      );
    },
    [images, audios, comment, setComment]
  );

  const onFileDelete = useCallback(
    (fileId: IFile['id']) => {
      setComment(
        assocPath(
          ['files'],
          comment.files.filter(file => file.id != fileId),
          comment
        )
      );
    },
    [setComment, comment]
  );

  const onTitleChange = useCallback(
    (fileId: IFile['id'], title: IFile['metadata']['title']) => {
      setComment(
        assocPath(
          ['files'],
          comment.files.map(file =>
            file.id === fileId ? { ...file, metadata: { ...file.metadata, title } } : file
          ),
          comment
        )
      );
    },
    [comment, setComment]
  );

  const onAudioMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      setComment(
        assocPath(
          ['files'],
          [
            ...images,
            ...(moveArrItem(
              oldIndex,
              newIndex,
              audios.filter(file => !!file)
            ) as IFile[]),
          ],
          comment
        )
      );
    },
    [images, audios, comment, setComment]
  );

  return (
    hasAttaches && (
      <div className={styles.attaches} onDropCapture={onDrop}>
        {hasImageAttaches && (
          <SortableImageGrid
            onDelete={onFileDelete}
            onSortEnd={onImageMove}
            axis="xy"
            items={images}
            locked={locked_images}
            pressDelay={50}
            helperClass={styles.helper}
            size={120}
          />
        )}

        {hasAudioAttaches && (
          <SortableAudioGrid
            items={audios}
            onDelete={onFileDelete}
            onTitleChange={onTitleChange}
            onSortEnd={onAudioMove}
            axis="y"
            locked={locked_audios}
            pressDelay={50}
            helperClass={styles.helper}
          />
        )}
      </div>
    )
  );
};

export { CommentFormAttaches };
