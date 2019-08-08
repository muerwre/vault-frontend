import React, { FC, ReactChildren } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import * as styles from './styles.scss';
import { ImageUpload } from '~/components/upload/ImageUpload';
import { IFile } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';

interface IProps {
  items: IFile[];
  locked: IUploadStatus[];
};

const SortableItem = SortableElement(({ children }) => <div className={styles.item}>{children}</div>);

const SortableList = SortableContainer(({ items, locked }: { items: IFile[], locked: IUploadStatus[] }) => {
  return (
    <div className={styles.grid}>
      {
        items.map((file, index) => (
          <SortableItem key={file.id} index={index}>
            <ImageUpload
              thumb={file.url}
            />
          </SortableItem>
        ))
      }
      <div style={{ clear: 'both' }} />
    </div>
  );
});

const ImageGrid: FC<IProps> = ({
  items,
  locked,
}) => {


  return (
    <SortableList onSortEnd={console.log} axis="xy" items={items} locked={locked} />
  )
}

export { ImageGrid };