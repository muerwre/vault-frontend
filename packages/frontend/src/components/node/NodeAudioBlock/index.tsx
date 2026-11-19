import { FC } from 'react';

import classNames from 'classnames';

import { AudioPlayer } from '~/components/common/AudioPlayer';
import { NodeComponentProps } from '~/constants/node';
import { useNodeAudios } from '~/hooks/node/useNodeAudios';

import styles from './styles.module.scss';

interface Props extends NodeComponentProps {
  className?: string;
  /** Shows only this many songs from the top. */
  limit?: number;
  /** Renders the songs as compact player rows. */
  compact?: boolean;
}

const NodeAudioBlock: FC<Props> = ({ node, className, limit, compact }) => {
  const audios = useNodeAudios(node);

  return (
    <div className={classNames(styles.wrap, className)}>
      {audios.slice(0, limit).map((file) => (
        <AudioPlayer key={file.id} file={file} compact={compact} />
      ))}
    </div>
  );
};

export { NodeAudioBlock };
