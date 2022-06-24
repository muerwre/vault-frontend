import React, { FC, useCallback } from 'react';

import { SortableImageGrid } from '~/components/sortable';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';

interface IProps {
  files: IFile[];
  setFiles: (val: IFile[]) => void;
  locked: UploadStatus[];
}

const ImageGrid: FC<IProps> = ({ files, setFiles, locked }) => {
  const { innerWidth } = useWindowSize();

  const onMove = useCallback(
    (newFiles: IFile[]) => {
      setFiles(newFiles.filter(it => it));
    },
    [setFiles, files]
  );

  const onDrop = useCallback(
    (remove_id: IFile['id']) => {
      setFiles(files.filter(file => file && file.id !== remove_id));
    },
    [setFiles, files]
  );

  return (
    <SortableImageGrid
      onDelete={onDrop}
      onSortEnd={onMove}
      items={files}
      locked={locked}
      size={innerWidth > 768 ? 220 : 160}
    />
  );
};

export { ImageGrid };
