import React, { FC, ReactChildren, useCallback } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import * as styles from './styles.scss';
import { ImageUpload } from '~/components/upload/ImageUpload';
import { IFile } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';

interface IProps {
  items: IFile[];
  locked: IUploadStatus[];
  onFileMove: (o: number, n: number) => void;
};

const SortableItem = SortableElement(({ children }) => <div className={styles.item}>{children}</div>);

const SortableList = SortableContainer(({ items, locked }: { items: IFile[], locked: IUploadStatus[] }) => {
  return (
    <div className={styles.grid}>
      {
        items.map((file, index) => (
          <SortableItem key={file.id} index={index} collection={0}>
            <ImageUpload
              id={file.id}
              thumb={file.url}
            />
          </SortableItem>
        ))
      }
      {
        locked.map((item, index) => (
          <SortableItem key={item.temp_id} index={index} collection={1} disabled>
            <ImageUpload
              thumb={item.preview}
              progress={item.progress}
              is_uploading
            />
          </SortableItem>
        ))
      }
    </div>
  );
});

const ImageGrid: FC<IProps> = ({
  items,
  locked,
  onFileMove,
}) => {
  const onMove = useCallback(({ oldIndex, newIndex }) => onFileMove(oldIndex, newIndex), [onFileMove]);

  return (
    <SortableList onSortEnd={onMove} axis="xy" items={items} locked={locked} />
  )
}

export { ImageGrid };