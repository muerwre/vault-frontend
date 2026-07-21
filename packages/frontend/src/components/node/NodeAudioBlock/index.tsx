import { FC } from 'react';

import { AudioPlayer } from '~/components/common/AudioPlayer';
import { NodeComponentProps } from '~/constants/node';
import { useNodeAudios } from '~/hooks/node/useNodeAudios';

import styles from './styles.module.scss';

interface Props extends NodeComponentProps {}

const NodeAudioBlock: FC<Props> = ({ node }) => {
  const audios = useNodeAudios(node);

  return (
    <div className={styles.wrap}>
      {audios.map((file) => (
        <AudioPlayer key={file.id} file={file} />
      ))}
    </div>
  );
};

export { NodeAudioBlock };
