import React, { FC, useCallback } from 'react';
import { SortableContainer, SortableElement, SortEvent, SortEnd } from 'react-sortable-hoc';
import * as styles from './styles.scss';
import { ImageUpload } from '~/components/upload/ImageUpload';
import { IFile, INode } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';
import { getURL } from '~/utils/dom';
import assocPath from 'ramda/es/assocPath';
import { moveArrItem } from '~/utils/fn';

interface IProps {
  data: INode;
  setData: (val: INode) => void;
  locked: IUploadStatus[];
}

const SortableItem = SortableElement(({ children }) => (
  <div className={styles.item}>{children}</div>
));

const SortableList = SortableContainer(
  ({ items, locked }: { items: IFile[]; locked: IUploadStatus[] }) => (
    <div className={styles.grid}>
      {items.map((file, index) => (
        <SortableItem key={file.id} index={index} collection={0}>
          <ImageUpload id={file.id} thumb={getURL(file)} />
        </SortableItem>
      ))}

      {locked.map((item, index) => (
        <SortableItem key={item.temp_id} index={index} collection={1} disabled>
          <ImageUpload thumb={item.preview} progress={item.progress} is_uploading />
        </SortableItem>
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

  return (
    <SortableList
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
