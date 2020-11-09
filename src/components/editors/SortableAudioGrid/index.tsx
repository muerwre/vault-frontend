import React from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import { AudioUpload } from '~/components/upload/AudioUpload';
import styles from './styles.module.scss';
import { SortableAudioGridItem } from '~/components/editors/SortableAudioGridItem';
import { IFile } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';
import { AudioPlayer } from '~/components/media/AudioPlayer';

const SortableAudioGrid = SortableContainer(
  ({
    items,
    locked,
    onDelete,
    onTitleChange,
  }: {
    items: IFile[];
    locked: IUploadStatus[];
    onDelete: (file_id: IFile['id']) => void;
    onTitleChange: (file_id: IFile['id'], title: IFile['metadata']['title']) => void;
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
          <SortableAudioGridItem key={item.temp_id} index={index} collection={1} disabled>
            <AudioUpload title={item.name} progress={item.progress} is_uploading />
          </SortableAudioGridItem>
        ))}
      </div>
    );
  }
);

export { SortableAudioGrid };
