import React, { FC } from 'react';

import { NodeAudioBlock } from '~/components/node/NodeAudioBlock';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { NodeComponentProps } from '~/constants/node';

const LabAudio: FC<NodeComponentProps> = ({ node, isLoading }) => (
  <Placeholder active={isLoading} width="100%" height={100}>
    <NodeAudioBlock node={node} isLoading={isLoading} />
  </Placeholder>
);

export { LabAudio };
