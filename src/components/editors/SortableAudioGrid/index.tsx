import React from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import { AudioUpload } from '~/components/upload/AudioUpload';
import * as styles from './styles.scss';
import { SortableImageGridItem } from '~/components/editors/SortableImageGridItem';
import { IFile } from '~/redux/types';
import { IUploadStatus } from '~/redux/uploads/reducer';
import { AudioPlayer } from '~/components/media/AudioPlayer';

const SortableAudioGrid = SortableContainer(
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
            <AudioPlayer file={file} onDrop={onDrop} />
          </SortableImageGridItem>
        ))}

      {locked.map((item, index) => (
        <SortableImageGridItem key={item.temp_id} index={index} collection={1} disabled>
          <AudioUpload title={item.name} progress={item.progress} is_uploading />
        </SortableImageGridItem>
      ))}
    </div>
  )
);

export { SortableAudioGrid };
