import React, { FC, useCallback } from 'react';
import classNames from 'classnames';
import styles from './styles.module.scss';
import { ArcProgress } from '~/components/input/ArcProgress';
import { IFile } from '~/types';
import { Icon } from '~/components/input/Icon';

interface IProps {
  id?: IFile['id'];
  thumb?: string;
  progress?: number;
  onDrop?: (file_id: IFile['id']) => void;

  is_uploading?: boolean;
}

const ImageUpload: FC<IProps> = ({ thumb, progress, is_uploading, id, onDrop }) => {
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

      <div className={classNames(styles.thumb_wrap, { is_uploading })}>
        {thumb && <div className={styles.thumb} style={{ backgroundImage: `url("${thumb}")` }} />}
        {is_uploading && (
          <div className={styles.progress}>
            <ArcProgress size={72} progress={progress} />
          </div>
        )}
      </div>
    </div>
  );
};

export { ImageUpload };
