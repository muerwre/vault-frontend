import React, { FC, HTMLAttributes } from 'react';
import { range } from 'ramda';
import * as styles from './styles.scss';
import { Group } from '~/components/containers/Group';
import { INode } from '~/redux/types';
import { getURL } from '~/utils/dom';

type IProps = HTMLAttributes<HTMLDivElement> & {
  items: Partial<INode>[];
};

const NodeRelated: FC<IProps> = ({ title, items }) => (
  <Group className={styles.wrap}>
    <div className={styles.title}>
      <div className={styles.line} />
      <div className={styles.text}>{title}</div>
      <div className={styles.line} />
    </div>
    <div className={styles.grid}>
      {items.map(item => (
        <div
          className={styles.item}
          key={item.id}
          style={{ backgroundImage: `url("${getURL({ url: item.thumbnail })}")` }}
        />
      ))}
    </div>
  </Group>
);

export { NodeRelated };
