import React, { FC, useCallback } from 'react';

import { SortEnd } from 'react-sortable-hoc';

import { SortableAudioGrid } from '~/components/editors/SortableAudioGrid';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { UploadStatus } from '~/store/uploader/UploaderStore';
import { IFile } from '~/types';
import { moveArrItem } from '~/utils/fn';

import styles from './styles.module.scss';


interface IProps {
  files: IFile[];
  setFiles: (val: IFile[]) => void;
  locked: UploadStatus[];
}

const AudioGrid: FC<IProps> = ({ files, setFiles, locked }) => {
  const { innerWidth } = useWindowSize();

  const onMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      setFiles(
        moveArrItem(
          oldIndex,
          newIndex,
          files.filter(file => !!file)
        ) as IFile[]
      );
    },
    [setFiles, files]
  );

  const onDrop = useCallback(
    (remove_id: IFile['id']) => {
      setFiles(files.filter(file => file && file.id !== remove_id));
    },
    [setFiles, files]
  );

  const onTitleChange = useCallback(
    (changeId: IFile['id'], title: string) => {
      setFiles(
        files.map(file =>
          file && file.id === changeId ? { ...file, metadata: { ...file.metadata, title } } : file
        )
      );
    },
    [setFiles, files]
  );

  return (
    <SortableAudioGrid
      onDelete={onDrop}
      onTitleChange={onTitleChange}
      onSortEnd={onMove}
      axis="xy"
      items={files}
      locked={locked}
      pressDelay={innerWidth < 768 ? 200 : 0}
      helperClass={styles.helper}
    />
  );
};

export { AudioGrid };
