import React from 'react';

import { SortableContainer } from 'react-sortable-hoc';

import { SortableAudioGridItem } from '~/components/editors/SortableAudioGridItem';
import { AudioPlayer } from '~/components/media/AudioPlayer';
import { AudioUpload } from '~/components/upload/AudioUpload';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';

import styles from './styles.module.scss';

const SortableAudioGrid = SortableContainer(
  ({
    items,
    locked,
    onDelete,
    onTitleChange,
  }: {
    items: IFile[];
    locked: UploadStatus[];
    onDelete: (file_id: IFile['id']) => void;
    onTitleChange: (file_id: IFile['id'], title: string) => void;
  }) => {
    return (
      <div className={styles.grid}>
        {items
          .filter(file => file && file.id)
          .map((file, index) => (
            <SortableAudioGridItem key={file.id} index={index} collection={0}>
              <AudioPlayer
                file={file}
                onDelete={onDelete}
                onTitleChange={onTitleChange}
                isEditing
              />
            </SortableAudioGridItem>
          ))}

        {locked.map((item, index) => (
          <SortableAudioGridItem key={item.id} index={index} collection={1} disabled>
            <AudioUpload title={item.name} progress={item.progress} is_uploading />
          </SortableAudioGridItem>
        ))}
      </div>
    );
  }
);

export { SortableAudioGrid };
