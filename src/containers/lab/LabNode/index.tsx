import React, { FC } from 'react';
import { INode } from '~/redux/types';
import { NodePanelInner } from '~/components/node/NodePanelInner';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import styles from './styles.module.scss';
import { Card } from '~/components/containers/Card';
import { NodePanelLab } from '~/components/node/NodePanelLab';

interface IProps {
  node: INode;
}

const LabNode: FC<IProps> = ({ node }) => {
  const { inline, block, head } = useNodeBlocks(node, false);

  console.log(node.id, { inline, block, head });

  return (
    <Card seamless className={styles.wrap}>
      <div className={styles.head}>
        <NodePanelLab node={node} />
      </div>

      {head}
      {block}
      {inline}
    </Card>
  );
};

export { LabNode };
