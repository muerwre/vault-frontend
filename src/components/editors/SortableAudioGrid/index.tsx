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
    onDrop,
    onTitleChange,
  }: {
    items: IFile[];
    locked: IUploadStatus[];
    onDrop: (file_id: IFile['id']) => void;
    onTitleChange: (file_id: IFile['id'], title: IFile['metadata']['title']) => void;
  }) => {
    console.log(locked);

    return (
      <div className={styles.grid}>
        {items
          .filter(file => file && file.id)
          .map((file, index) => (
            <SortableAudioGridItem key={file.id} index={index} collection={0}>
              <AudioPlayer file={file} onDrop={onDrop} onTitleChange={onTitleChange} isEditing />
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
