import React from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import { ImageUpload } from '~/components/upload/ImageUpload';
import * as styles from './styles.scss';
import { SortableImageGridItem } from '~/components/editors/SortableImageGridItem';
import { IFile } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';
import { getURL } from '~/utils/dom';

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

export { SortableImageGrid };