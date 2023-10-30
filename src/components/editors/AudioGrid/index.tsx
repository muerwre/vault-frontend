import React, { FC, useCallback } from 'react';

import { SortableAudioGrid } from '~/components/sortable/SortableAudioGrid';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';

interface IProps {
  files: IFile[];
  setFiles: (val: IFile[]) => void;
  locked: UploadStatus[];
}

const AudioGrid: FC<IProps> = ({ files, setFiles, locked }) => {
  const onMove = useCallback(
    (newFiles: IFile[]) => {
      setFiles(newFiles);
    },
    [setFiles],
  );

  const onDrop = useCallback(
    (remove_id: IFile['id']) => {
      setFiles(files.filter((file) => file && file.id !== remove_id));
    },
    [setFiles, files],
  );

  const onTitleChange = useCallback(
    (changeId: IFile['id'], title: string) => {
      setFiles(
        files.map((file) =>
          file && file.id === changeId
            ? { ...file, metadata: { ...file.metadata, title } }
            : file,
        ),
      );
    },
    [setFiles, files],
  );

  return (
    <SortableAudioGrid
      onDelete={onDrop}
      onTitleChange={onTitleChange}
      onSortEnd={onMove}
      items={files}
      locked={locked}
    />
  );
};

export { AudioGrid };
