import React, { FC, ReactElement } from 'react';

import { Hoverable } from '~/components/common/Hoverable';
import { SubTitle } from '~/components/common/SubTitle';
import { Group } from '~/components/containers/Group';
import { NodeRelatedItem } from '~/components/node/NodeRelatedItem';
import { INode } from '~/types';

import styles from './styles.module.scss';

interface IProps {
  title: ReactElement | string;
  items: Partial<INode>[];
}

const NodeRelated: FC<IProps> = ({ title, items }) => {
  return (
    <Group className={styles.wrap}>
      <SubTitle className={styles.title}>{title}</SubTitle>

      <div className={styles.grid}>
        {items.map((item) => (
          <Hoverable key={item.id} className={styles.item}>
            <NodeRelatedItem item={item} />
          </Hoverable>
        ))}
      </div>
    </Group>
  );
};

export { NodeRelated };
