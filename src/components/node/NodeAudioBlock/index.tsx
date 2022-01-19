import React, { FC } from 'react';

import { AudioPlayer } from '~/components/media/AudioPlayer';
import { INodeComponentProps } from '~/constants/node';
import { useNodeAudios } from '~/hooks/node/useNodeAudios';

import styles from './styles.module.scss';

interface IProps extends INodeComponentProps {}

const NodeAudioBlock: FC<IProps> = ({ node }) => {
  const audios = useNodeAudios(node);

  return (
    <div className={styles.wrap}>
      {audios.map(file => (
        <AudioPlayer key={file.id} file={file} />
      ))}
    </div>
  );
};

export { NodeAudioBlock };
