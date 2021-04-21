import React, { FC } from 'react';
import { INodeComponentProps } from '~/redux/node/constants';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { NodeAudioBlock } from '~/components/node/NodeAudioBlock';

const LabAudio: FC<INodeComponentProps> = ({ node, isLoading }) => (
  <Placeholder active={isLoading} width="100%" height={100}>
    <NodeAudioBlock node={node} isLoading={isLoading} />
  </Placeholder>
);

export { LabAudio };
