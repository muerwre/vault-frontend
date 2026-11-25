import { FC, memo, useMemo } from 'react';

import { MasonryGrid } from '~/components/common/MasonryGrid';
import { EMPTY_NODE, NODE_TYPES } from '~/constants/node';
import { INode } from '~/types';
import { values } from '~/utils/ramda';

import { LabNode } from '../LabGrid/components/LabNode';

interface LabLoadingProps {}

const PLACEHOLDER_COUNT = 9;

const getRandomNodeType = () =>
  values(NODE_TYPES)[Math.floor(Math.random() * values(NODE_TYPES).length)];

const getKey = (node: INode) => node.id!;

const renderNode = (node: INode) => (
  <LabNode node={node} isLoading lastSeen="" commentCount={0} />
);

const LabLoading: FC<LabLoadingProps> = memo(() => {
  const nodes = useMemo(
    () =>
      Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => ({
        ...EMPTY_NODE,
        id: i,
        type: getRandomNodeType(),
      })),
    [],
  );

  return <MasonryGrid items={nodes} itemKey={getKey} render={renderNode} />;
});

export { LabLoading };
