import React, { FC, useCallback } from 'react';

import { SortableAudioGrid } from '~/components/sortable/SortableAudioGrid';
import { SortableImageGrid } from '~/components/sortable/SortableImageGrid';
import { COMMENT_FILE_TYPES } from '~/constants/uploads';
import { useFileDropZone } from '~/hooks';
import { IFile } from '~/types';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';

import styles from './styles.module.scss';

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
    (newFiles: IFile[]) => {
      setFiles([...filesAudios, ...newFiles.filter((it) => it)]);
    },
    [setFiles, filesImages, filesAudios],
  );

  const onAudioMove = useCallback(
    (newFiles: IFile[]) => {
      setFiles([...filesImages, ...newFiles]);
    },
    [setFiles, filesImages, filesAudios],
  );

  const onFileDelete = useCallback(
    (fileId: IFile['id']) => {
      setFiles(files.filter((file) => file.id !== fileId));
    },
    [files, setFiles],
  );

  const onAudioTitleChange = useCallback(
    (fileId: IFile['id'], title: string) => {
      setFiles(
        files.map((file) =>
          file.id === fileId
            ? { ...file, metadata: { ...file.metadata, title } }
            : file,
        ),
      );
    },
    [files, setFiles],
  );

  if (!hasAttaches) return null;

  return (
    <div className={styles.attaches} onDropCapture={onDrop}>
      {hasImageAttaches && (
        <SortableImageGrid
          onDelete={onFileDelete}
          onSortEnd={onImageMove}
          items={filesImages}
          locked={pendingImages}
          size={160}
        />
      )}

      {hasAudioAttaches && (
        <SortableAudioGrid
          items={filesAudios}
          onDelete={onFileDelete}
          onTitleChange={onAudioTitleChange}
          onSortEnd={onAudioMove}
          locked={pendingAudios}
        />
      )}
    </div>
  );
};

export { CommentFormAttaches };
