import { FC } from 'react';

import { MAX_LIST_SONGS } from '@vault/common/constants';

import { NodeAudioBlock } from '~/components/node/NodeAudioBlock';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { NodeComponentProps } from '~/constants/node';

import styles from './styles.module.scss';

const LabAudio: FC<NodeComponentProps> = ({ node, isLoading }) => (
  <Placeholder active={isLoading} width="100%" height={100}>
    <NodeAudioBlock
      node={node}
      isLoading={isLoading}
      className={styles.songs}
      // as many as the lab sends; the rest are on the node
      limit={MAX_LIST_SONGS}
      compact
    />
  </Placeholder>
);

export { LabAudio };
