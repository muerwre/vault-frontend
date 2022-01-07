import React, { FC, useCallback } from 'react';
import { SortEnd } from 'react-sortable-hoc';
import styles from './styles.module.scss';
import { IFile } from '~/redux/types';
import { moveArrItem } from '~/utils/fn';
import { SortableImageGrid } from '~/components/editors/SortableImageGrid';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { useWindowSize } from '~/hooks/dom/useWindowSize';

interface IProps {
  files: IFile[];
  setFiles: (val: IFile[]) => void;
  locked: UploadStatus[];
}

const ImageGrid: FC<IProps> = ({ files, setFiles, locked }) => {
  const { innerWidth } = useWindowSize();

  const onMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      setFiles(
        moveArrItem(
          oldIndex,
          newIndex,
          files.filter(file => !!file)
        ) as IFile[]
      );
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
      axis="xy"
      items={files}
      locked={locked}
      pressDelay={innerWidth < 768 ? 200 : 0}
      helperClass={styles.helper}
    />
  );
};

export { ImageGrid };
