import React, { FC, useCallback } from 'react';

import { ImageUpload } from '~/components/upload/ImageUpload';
import { ImagePresets } from '~/constants/urls';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';

import { SortableGrid } from '../SortableGrid';

type OnSortEnd = (newValue: IFile[]) => void;

interface SortableImageGridProps {
  onSortEnd: OnSortEnd;
  items: IFile[];
  locked: UploadStatus[];
  onDelete: (file_id: IFile['id']) => void;
  className?: string;
  size?: number;
}

const SortableImageGrid: FC<SortableImageGridProps> = ({
  items,
  locked,
  onDelete,
  className,
  onSortEnd,
  size,
}) => {
  const renderItem = useCallback<FC<{ item: IFile }>>(
    ({ item }) => (
      <ImageUpload id={item.id} thumb={getURL(item, ImagePresets.cover)} onDrop={onDelete} />
    ),
    []
  );

  const renderLocked = useCallback<FC<{ locked: UploadStatus }>>(
    ({ locked }) => (
      <ImageUpload
        thumb={locked.thumbnail}
        onDrop={onDelete}
        progress={locked.progress}
        is_uploading
      />
    ),
    []
  );

  return (
    <SortableGrid
      items={items}
      locked={locked}
      getID={it => it.id}
      getLockedID={it => it.id}
      renderItem={renderItem}
      renderLocked={renderLocked}
      onSortEnd={onSortEnd}
      className={className}
      size={size}
    />
  );
};

export { SortableImageGrid };
