import React, { FC } from 'react';

import { NodeVideoBlock } from '~/components/node/NodeVideoBlock';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { NodeComponentProps } from '~/constants/node';

const LabVideo: FC<NodeComponentProps> = ({ node, isLoading }) => (
  <Placeholder active={isLoading} width="100%" height={400}>
    <NodeVideoBlock node={node} isLoading={isLoading} />
  </Placeholder>
);

export { LabVideo };
