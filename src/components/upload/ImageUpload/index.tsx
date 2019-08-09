import React, { FC } from 'react';
import classNames from 'classnames';
import * as styles from './styles.scss';
import { ArcProgress } from '~/components/input/ArcProgress';

interface IProps {
  id?: string;
  thumb?: string;
  progress?: number;

  is_uploading?: boolean;
}

const ImageUpload: FC<IProps> = ({
  thumb,
  id,
  progress,
  is_uploading,
}) => (
  <div className={styles.wrap}>
    <div className={classNames(styles.thumb_wrap, { is_uploading })}>
      {thumb && <div className={styles.thumb} style={{ background: `url("${thumb}")` }}>{id}</div>}
      {is_uploading && <div className={styles.progress}><ArcProgress size={72} progress={progress} /></div>}
    </div>
  </div>
);

export { ImageUpload };
