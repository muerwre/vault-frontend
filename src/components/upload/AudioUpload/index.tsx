import { FC, useCallback } from 'react';

import classNames from 'classnames';

import { ArcProgress } from '~/components/common/ArcProgress';
import { Icon } from '~/components/common/Icon';

import styles from './styles.module.scss';

interface Props {
  id?: string;
  title?: string;
  progress?: number;
  onDrop?: (file_id: string) => void;

  uploading?: boolean;
}

const AudioUpload: FC<Props> = ({ title, progress, uploading, id, onDrop }) => {
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
        {uploading && (
          <div className={styles.progress}>
            <ArcProgress size={40} progress={progress} />
          </div>
        )}
        {title && <div className={styles.title}>{title}</div>}
      </div>
    </div>
  );
};

export { AudioUpload };
