import { FC, ReactNode, useCallback } from 'react';

import { SortableAudioGrid } from '~/components/sortable/SortableAudioGrid';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';

interface Props {
  files: IFile[];
  setFiles: (val: IFile[]) => void;
  locked: UploadStatus[];
  trailing?: ReactNode;
  /** Songs joined into one ridged list, like a post's player. */
  outlined?: boolean;
}

const UploadAudioGrid: FC<Props> = ({
  files,
  setFiles,
  locked,
  trailing,
  outlined,
}) => {
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
      trailing={trailing}
      outlined={outlined}
    />
  );
};

export { UploadAudioGrid };
