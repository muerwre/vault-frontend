import React, { FC, ReactElement } from 'react';
import styles from './styles.module.scss';
import { Group } from '~/components/containers/Group';
import { INode } from '~/redux/types';
import { NodeRelatedItem } from '~/components/node/NodeRelatedItem';

interface IProps {
  title: ReactElement | string;
  items: Partial<INode>[];
}

const NodeRelated: FC<IProps> = ({ title, items }) => {
  return (
    <Group className={styles.wrap}>
      <div className={styles.title}>
        <div className={styles.text}>{title}</div>
      </div>

      <div className={styles.grid}>
        {items.map(item => (
          <NodeRelatedItem item={item} key={item.id} />
        ))}
      </div>
    </Group>
  );
};

export { NodeRelated };
