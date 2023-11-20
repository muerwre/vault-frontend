import { FC, useCallback } from 'react';

import { SortableImageGrid } from '~/components/sortable/SortableImageGrid';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';

interface IProps {
  files: IFile[];
  setFiles: (val: IFile[]) => void;
  locked: UploadStatus[];
}

const ImageGrid: FC<IProps> = ({ files, setFiles, locked }) => {
  const { isTablet } = useWindowSize();

  const onMove = useCallback(
    (newFiles: IFile[]) => {
      setFiles(newFiles.filter((it) => it));
    },
    [setFiles],
  );

  const onDrop = useCallback(
    (id: IFile['id']) => {
      setFiles(files.filter((file) => file && file.id !== id));
    },
    [setFiles, files],
  );

  return (
    <SortableImageGrid
      onDelete={onDrop}
      onSortEnd={onMove}
      items={files}
      locked={locked}
      size={!isTablet ? 220 : (innerWidth - 60) / 2}
    />
  );
};

export { ImageGrid };
