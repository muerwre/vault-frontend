import { FC } from 'react';

import { NodeAudioBlock } from '~/components/node/NodeAudioBlock';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { NodeComponentProps } from '~/constants/node';

import styles from './styles.module.scss';

/** The card previews the start of the track list; the rest is on the node. */
const MAX_SONGS = 3;

const LabAudio: FC<NodeComponentProps> = ({ node, isLoading }) => (
  <Placeholder active={isLoading} width="100%" height={100}>
    <NodeAudioBlock
      node={node}
      isLoading={isLoading}
      className={styles.songs}
      limit={MAX_SONGS}
      compact
    />
  </Placeholder>
);

export { LabAudio };
