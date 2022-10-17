import React, { FC, memo } from 'react';

import { Columns } from '~/components/containers/Columns';
import { LabNode } from '~/components/lab/LabNode';
import { EMPTY_NODE, NODE_TYPES } from '~/constants/node';
import { values } from '~/utils/ramda';

interface LabLoadingProps {}

const getRandomNodeType = () =>
  values(NODE_TYPES)[Math.floor(Math.random() * values(NODE_TYPES).length)];

const LoadingNode = memo(() => (
  <LabNode
    node={{ ...EMPTY_NODE, type: getRandomNodeType() }}
    isLoading
    lastSeen=""
    commentCount={0}
  />
));

const LabLoading: FC<LabLoadingProps> = memo(() => (
  <Columns>
    <LoadingNode />
    <LoadingNode />
    <LoadingNode />
    <LoadingNode />
    <LoadingNode />
    <LoadingNode />
    <LoadingNode />
    <LoadingNode />
    <LoadingNode />
  </Columns>
));

export { LabLoading };
