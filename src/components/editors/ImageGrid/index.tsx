import React, { FC, useCallback } from 'react';
import { SortEnd } from 'react-sortable-hoc';
import * as styles from './styles.scss';
import { IFile, INode } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';
import assocPath from 'ramda/es/assocPath';
import { moveArrItem } from '~/utils/fn';
import reject from 'ramda/es/reject';
import { SortableImageGrid } from '~/components/editors/SortableImageGrid';

interface IProps {
  files: IFile[];
  setFiles: (val: IFile[]) => void;
  locked: IUploadStatus[];
}

const ImageGrid: FC<IProps> = ({ files, setFiles, locked }) => {
  const onMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      setFiles(moveArrItem(oldIndex, newIndex, files) as IFile[]);
    },
    [setFiles, files]
  );

  const onDrop = useCallback(
    (remove_id: IFile['id']) => {
      setFiles(files.filter(file => file.id === remove_id));
    },
    [setFiles, files]
  );

  return (
    <SortableImageGrid
      onDrop={onDrop}
      onSortEnd={onMove}
      axis="xy"
      items={files}
      locked={locked}
      pressDelay={window.innerWidth < 768 ? 200 : 0}
      helperClass={styles.helper}
    />
  );
};

export { ImageGrid };
