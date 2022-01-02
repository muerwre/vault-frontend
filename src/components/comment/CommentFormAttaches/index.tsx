import React, { FC, useCallback, useMemo } from 'react';
import styles from './styles.module.scss';
import { SortableImageGrid } from '~/components/editors/SortableImageGrid';
import { SortableAudioGrid } from '~/components/editors/SortableAudioGrid';
import { IFile } from '~/redux/types';
import { SortEnd } from 'react-sortable-hoc';
import { moveArrItem } from '~/utils/fn';
import { useFileDropZone } from '~/hooks';
import { COMMENT_FILE_TYPES, UPLOAD_TYPES } from '~/redux/uploads/constants';
import { useFileUploaderContext } from '~/hooks/data/useFileUploader';

const CommentFormAttaches: FC = () => {
  const uploader = useFileUploaderContext();
  const { files, pending, setFiles, uploadFiles } = uploader!;

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

  const onDrop = useFileDropZone(uploadFiles, COMMENT_FILE_TYPES);

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
    (fileId: IFile['id'], title: string) => {
      setFiles(
        files.map(file =>
          file.id === fileId ? { ...file, metadata: { ...file.metadata, title } } : file
        )
      );
    },
    [files, setFiles]
  );

  if (!hasAttaches) return null;

  return (
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
  );
};

export { CommentFormAttaches };
