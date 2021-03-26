import React, { useCallback } from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import { ImageUpload } from '~/components/upload/ImageUpload';
import styles from './styles.module.scss';
import { SortableImageGridItem } from '~/components/editors/SortableImageGridItem';
import { IFile } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import classNames from 'classnames';

const SortableImageGrid = SortableContainer(
  ({
    items,
    locked,
    onDelete,
    className,
  }: {
    items: IFile[];
    locked: IUploadStatus[];
    onDelete: (file_id: IFile['id']) => void;
    size?: number;
    className?: string;
  }) => {
    const preventEvent = useCallback(event => event.preventDefault(), []);

    return (
      <div className={classNames(styles.grid, className)} onDropCapture={preventEvent}>
        {items
          .filter(file => file && file.id)
          .map((file, index) => (
            <SortableImageGridItem key={file.id} index={index} collection={0}>
              <ImageUpload id={file.id} thumb={getURL(file, PRESETS.cover)} onDrop={onDelete} />
            </SortableImageGridItem>
          ))}

        {locked.map((item, index) => (
          <SortableImageGridItem key={item.temp_id} index={index} collection={1} disabled>
            <ImageUpload thumb={item.preview} progress={item.progress} is_uploading />
          </SortableImageGridItem>
        ))}
      </div>
    );
  }
);

export { SortableImageGrid };
