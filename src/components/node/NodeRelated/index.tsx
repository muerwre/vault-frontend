import { FC, ReactElement } from 'react';

import { Group } from '~/components/common/Group';
import { Hoverable } from '~/components/common/Hoverable';
import { SubTitle } from '~/components/common/SubTitle';
import { NodeThumbnail } from '~/components/node/NodeThumbnail';
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
            <NodeThumbnail item={item} />
          </Hoverable>
        ))}
      </div>
    </Group>
  );
};

export { NodeRelated };
