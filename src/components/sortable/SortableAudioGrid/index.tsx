import React, { FC, useCallback } from 'react';

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

const SortableAudioGrid: FC<SortableAudioGridProps> = ({
  items,
  locked,
  onDelete,
  className,
  onSortEnd,
  onTitleChange,
}) => {
  const renderItem = useCallback<FC<{ item: IFile; key?: string | number }>>(
    ({ item, key }) => (
      <AudioPlayer
        file={item}
        onDelete={onDelete}
        isEditing
        onTitleChange={onTitleChange}
        key={key}
      />
    ),
    [onTitleChange, onDelete]
  );

  const renderLocked = useCallback<FC<{ locked: UploadStatus }>>(
    ({ locked }) => (
      <AudioUpload
        id={locked.id}
        is_uploading
        title={locked.name}
        progress={locked.progress}
        key={locked.id}
      />
    ),
    []
  );

  return (
    <SortableList
      items={items}
      locked={locked}
      getID={it => it.id}
      getLockedID={it => it.id}
      renderItem={renderItem}
      renderLocked={renderLocked}
      onSortEnd={onSortEnd}
      className={className}
    />
  );
};

export { SortableAudioGrid };
