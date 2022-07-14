import React, { FC, useCallback, useMemo } from 'react';

import { AudioPlayer } from '~/components/media/AudioPlayer';
import { AudioUpload } from '~/components/upload/AudioUpload';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';

import { SortableList } from '../SortableList';

type OnSortEnd = (newValue: IFile[]) => void;

interface SortableAudioGridProps {
  onSortEnd: OnSortEnd;
  items: IFile[];
  locked: UploadStatus[];
  className?: string;
  onDelete: (file_id: IFile['id']) => void;
  onTitleChange: (file_id: IFile['id'], title: string) => void;
}
const renderItem = ({
  item,
  key,
  onDelete,
  onTitleChange,
}: {
  item: IFile;
  key?: string | number;
  onDelete?: (id: IFile['id']) => void;
  onTitleChange?: (file_id: IFile['id'], title: string) => void;
}) => (
  <AudioPlayer file={item} onDelete={onDelete} isEditing onTitleChange={onTitleChange} key={key} />
);

const renderLocked = ({ locked }: { locked: UploadStatus }) => (
  <AudioUpload
    id={locked.id}
    uploading
    title={locked.name}
    progress={locked.progress}
    key={locked.id}
  />
);

const SortableAudioGrid: FC<SortableAudioGridProps> = ({
  items,
  locked,
  onDelete,
  className,
  onSortEnd,
  onTitleChange,
}) => {
  const renderItemProps = useMemo(() => ({ onDelete, onTitleChange }), [onDelete, onTitleChange]);
  const renderLockedProps = useMemo(() => ({}), []);

  return (
    <SortableList
      items={items}
      locked={locked}
      getID={it => it.id}
      getLockedID={it => it.id}
      renderItem={renderItem}
      renderItemProps={renderItemProps}
      renderLocked={renderLocked}
      renderLockedProps={renderLockedProps}
      onSortEnd={onSortEnd}
      className={className}
    />
  );
};

export { SortableAudioGrid };
