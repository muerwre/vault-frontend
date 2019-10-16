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
  data: INode;
  setData: (val: INode) => void;
  locked: IUploadStatus[];
}

const ImageGrid: FC<IProps> = ({ data, setData, locked }) => {
  const onMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      setData(assocPath(['files'], moveArrItem(oldIndex, newIndex, data.files), data));
    },
    [data, setData]
  );

  const onDrop = useCallback(
    (file_id: IFile['id']) => {
      setData(
        assocPath(['files'], reject(el => !el || !el.id || el.id === file_id, data.files), data)
      );
    },
    [setData, data]
  );

  return (
    <SortableImageGrid
      onDrop={onDrop}
      onSortEnd={onMove}
      axis="xy"
      items={data.files}
      locked={locked}
      pressDelay={window.innerWidth < 768 ? 200 : 0}
      helperClass={styles.helper}
    />
  );
};

export { ImageGrid };
