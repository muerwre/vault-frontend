import React, { FC, useCallback } from 'react';
import { SortableContainer, SortableElement, SortEvent, SortEnd } from 'react-sortable-hoc';
import * as styles from './styles.scss';
import { ImageUpload } from '~/components/upload/ImageUpload';
import { IFile, INode } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';
import { getURL } from '~/utils/dom';
import assocPath from 'ramda/es/assocPath';
import { moveArrItem } from '~/utils/fn';
import omit from 'ramda/es/omit';
import remove from 'ramda/es/remove';
import reject from 'ramda/es/reject';

interface IProps {
  data: INode;
  setData: (val: INode) => void;
  locked: IUploadStatus[];
}

const SortableImageGridItem = SortableElement(({ children }) => (
  <div className={styles.item}>{children}</div>
));

const SortableImageGrid = SortableContainer(
  ({
    items,
    locked,
    onDrop,
  }: {
    items: IFile[];
    locked: IUploadStatus[];
    onDrop: (file_id: IFile['id']) => void;
  }) => (
    <div className={styles.grid}>
      {items
        .filter(file => file && file.id)
        .map((file, index) => (
          <SortableImageGridItem key={file.id} index={index} collection={0}>
            <ImageUpload id={file.id} thumb={getURL(file)} onDrop={onDrop} />
          </SortableImageGridItem>
        ))}

      {locked.map((item, index) => (
        <SortableImageGridItem key={item.temp_id} index={index} collection={1} disabled>
          <ImageUpload thumb={item.preview} progress={item.progress} is_uploading />
        </SortableImageGridItem>
      ))}
    </div>
  )
);

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
