import React, { FC, useCallback } from 'react';

import classNames from 'classnames';

import { ArcProgress } from '~/components/input/ArcProgress';
import { Icon } from '~/components/input/Icon';
import { IFile } from '~/types';

import styles from './styles.module.scss';

interface IProps {
  id?: IFile['id'];
  thumb?: string;
  progress?: number;
  onDrop?: (file_id: IFile['id']) => void;

  uploading?: boolean;
}

const ImageUpload: FC<IProps> = ({ thumb, progress, uploading, id, onDrop }) => {
  const onDropFile = useCallback(() => {
    if (!id || !onDrop) return;
    onDrop(id);
  }, [id, onDrop]);

  return (
    <div className={styles.wrap}>
      {id && onDrop && (
        <div className={styles.drop} onMouseDown={onDropFile}>
          <Icon icon="close" />
        </div>
      )}

      <div className={classNames(styles.thumb_wrap, { uploading: uploading })}>
        {thumb && <div className={styles.thumb} style={{ backgroundImage: `url("${thumb}")` }} />}
        {uploading && (
          <div className={styles.progress}>
            <ArcProgress size={72} progress={progress} />
          </div>
        )}
      </div>
    </div>
  );
};

export { ImageUpload };
