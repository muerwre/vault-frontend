import React, { FC, useMemo } from 'react';

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
const renderItem = ({ item, onDelete }: { item: IFile; onDelete: (fileId: number) => void }) => (
  <ImageUpload id={item.id} thumb={getURL(item, ImagePresets.cover)} onDrop={onDelete} />
);

const renderLocked = ({
  locked,
  onDelete,
}: {
  locked: UploadStatus;
  onDelete: (fileId: number) => void;
}) => (
  <ImageUpload thumb={locked.thumbnail} onDrop={onDelete} progress={locked.progress} uploading />
);

const SortableImageGrid: FC<SortableImageGridProps> = ({
  items,
  locked,
  onDelete,
  className,
  onSortEnd,
  size,
}) => {
  const props = useMemo(() => ({ onDelete }), [onDelete]);

  return (
    <SortableGrid
      items={items}
      locked={locked}
      getID={it => it.id}
      getLockedID={it => it.id}
      renderItem={renderItem}
      renderItemProps={props}
      renderLocked={renderLocked}
      renderLockedProps={props}
      onSortEnd={onSortEnd}
      className={className}
      size={size}
    />
  );
};

export { SortableImageGrid };