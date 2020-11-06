import React from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import { ImageUpload } from '~/components/upload/ImageUpload';
import styles from './styles.module.scss';
import { SortableImageGridItem } from '~/components/editors/SortableImageGridItem';
import { IFile } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';

const SortableImageGrid = SortableContainer(
  ({
    items,
    locked,
    onDrop,
    size = 200,
  }: {
    items: IFile[];
    locked: IUploadStatus[];
    onDrop: (file_id: IFile['id']) => void;
    size?: number;
  }) => (
    <div
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${size}px, 1fr))` }}
    >
      {items
        .filter(file => file && file.id)
        .map((file, index) => (
          <SortableImageGridItem key={file.id} index={index} collection={0}>
            <ImageUpload id={file.id} thumb={getURL(file, PRESETS.cover)} onDrop={onDrop} />
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
