import { FC, ReactNode, useCallback } from 'react';

import { SortableImageGrid } from '~/components/sortable/SortableImageGrid';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';

interface Props {
  files: IFile[];
  setFiles: (val: IFile[]) => void;
  locked: UploadStatus[];
  trailing?: ReactNode;
}

const ImageGrid: FC<Props> = ({ files, setFiles, locked, trailing }) => {
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
      trailing={trailing}
      size={!isTablet ? 220 : (innerWidth - 60) / 2}
    />
  );
};

export { ImageGrid };
