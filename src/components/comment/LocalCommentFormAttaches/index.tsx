import React, { FC, useCallback, useMemo } from 'react';
import styles from '~/components/comment/CommentForm/styles.module.scss';
import { SortableImageGrid } from '~/components/editors/SortableImageGrid';
import { SortableAudioGrid } from '~/components/editors/SortableAudioGrid';
import { IFile } from '~/redux/types';
import { SortEnd } from 'react-sortable-hoc';
import { moveArrItem } from '~/utils/fn';
import { useDropZone } from '~/utils/hooks';
import { COMMENT_FILE_TYPES, UPLOAD_TYPES } from '~/redux/uploads/constants';
import { useFileUploaderContext } from '~/utils/hooks/fileUploader';

const LocalCommentFormAttaches: FC = () => {
  const { files, pending, setFiles, uploadFiles } = useFileUploaderContext();

  const images = useMemo(() => files.filter(file => file && file.type === UPLOAD_TYPES.IMAGE), [
    files,
  ]);

  const pendingImages = useMemo(() => pending.filter(item => item.type === UPLOAD_TYPES.IMAGE), [
    pending,
  ]);

  const audios = useMemo(() => files.filter(file => file && file.type === UPLOAD_TYPES.AUDIO), [
    files,
  ]);

  const pendingAudios = useMemo(() => pending.filter(item => item.type === UPLOAD_TYPES.AUDIO), [
    pending,
  ]);

  const onDrop = useDropZone(uploadFiles, COMMENT_FILE_TYPES);

  const hasImageAttaches = images.length > 0 || pendingImages.length > 0;
  const hasAudioAttaches = audios.length > 0 || pendingAudios.length > 0;
  const hasAttaches = hasImageAttaches || hasAudioAttaches;

  const onImageMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      setFiles([
        ...audios,
        ...(moveArrItem(
          oldIndex,
          newIndex,
          images.filter(file => !!file)
        ) as IFile[]),
      ]);
    },
    [images, audios, setFiles]
  );

  const onAudioMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      setFiles([
        ...images,
        ...(moveArrItem(
          oldIndex,
          newIndex,
          audios.filter(file => !!file)
        ) as IFile[]),
      ]);
    },
    [images, audios, setFiles]
  );

  const onFileDelete = useCallback(
    (fileId: IFile['id']) => {
      setFiles(files.filter(file => file.id !== fileId));
    },
    [setFiles, files]
  );

  const onAudioTitleChange = useCallback(
    (fileId: IFile['id'], title: IFile['metadata']['title']) => {
      setFiles(
        files.map(file =>
          file.id === fileId ? { ...file, metadata: { ...file.metadata, title } } : file
        )
      );
    },
    [files, setFiles]
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
            locked={pendingImages}
            pressDelay={50}
            helperClass={styles.helper}
            size={120}
          />
        )}

        {hasAudioAttaches && (
          <SortableAudioGrid
            items={audios}
            onDelete={onFileDelete}
            onTitleChange={onAudioTitleChange}
            onSortEnd={onAudioMove}
            axis="y"
            locked={pendingAudios}
            pressDelay={50}
            helperClass={styles.helper}
          />
        )}
      </div>
    )
  );
};

export { LocalCommentFormAttaches };
