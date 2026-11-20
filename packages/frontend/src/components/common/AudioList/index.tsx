import { FC } from 'react';

import classNames from 'classnames';

import { AudioPlayer } from '~/components/common/AudioPlayer';
import { IFile } from '~/types';

import styles from './styles.module.scss';

interface Props {
  files: IFile[];
  /** Renders the songs as compact player rows. */
  compact?: boolean;
  className?: string;
}

/** Songs as one card of player rows. */
const AudioList: FC<Props> = ({ files, compact, className }) => (
  <div className={classNames(styles.wrap, className)}>
    {files.map((file) => (
      <AudioPlayer key={file.id} file={file} compact={compact} />
    ))}
  </div>
);

export { AudioList };
