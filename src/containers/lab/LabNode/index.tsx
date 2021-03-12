import React, { FC } from 'react';
import { INode } from '~/redux/types';
import { NodePanelInner } from '~/components/node/NodePanelInner';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';

interface IProps {
  node: INode;
}

const LabNode: FC<IProps> = ({ node }) => {
  const { inline, block, head } = useNodeBlocks(node, false);

  return (
    <div>
      <NodePanelInner
        node={node}
        canEdit
        canLike
        canStar
        isLoading={false}
        onEdit={console.log}
        onLike={console.log}
        onStar={console.log}
        onLock={console.log}
      />

      {inline}
      {block}
      {head}
    </div>
  );
};

export { LabNode };
