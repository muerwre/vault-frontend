import React, { FC, useCallback } from 'react';
import styles from './styles.module.scss';
import { SortableImageGrid } from '~/components/editors/SortableImageGrid';
import { SortableAudioGrid } from '~/components/editors/SortableAudioGrid';
import { IFile } from '~/redux/types';
import { SortEnd } from 'react-sortable-hoc';
import { moveArrItem } from '~/utils/fn';
import { useFileDropZone } from '~/hooks';
import { COMMENT_FILE_TYPES } from '~/constants/uploads';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';

const CommentFormAttaches: FC = () => {
  const {
    files,
    pendingImages,
    pendingAudios,
    filesAudios,
    filesImages,
    uploadFiles,
    setFiles,
  } = useUploaderContext();

  const onDrop = useFileDropZone(uploadFiles, COMMENT_FILE_TYPES);

  const hasImageAttaches = filesImages.length > 0 || pendingImages.length > 0;
  const hasAudioAttaches = filesAudios.length > 0 || pendingAudios.length > 0;
  const hasAttaches = hasImageAttaches || hasAudioAttaches;

  const onImageMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      setFiles([
        ...filesAudios,
        ...(moveArrItem(
          oldIndex,
          newIndex,
          filesImages.filter(file => !!file)
        ) as IFile[]),
      ]);
    },
    [setFiles, filesImages, filesAudios]
  );

  const onAudioMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      setFiles([
        ...filesImages,
        ...(moveArrItem(
          oldIndex,
          newIndex,
          filesAudios.filter(file => !!file)
        ) as IFile[]),
      ]);
    },
    [setFiles, filesImages, filesAudios]
  );

  const onFileDelete = useCallback(
    (fileId: IFile['id']) => {
      setFiles(files.filter(file => file.id !== fileId));
    },
    [files, setFiles]
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
          items={filesImages}
          locked={pendingImages}
          pressDelay={50}
          helperClass={styles.helper}
          size={120}
        />
      )}

      {hasAudioAttaches && (
        <SortableAudioGrid
          items={filesAudios}
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
