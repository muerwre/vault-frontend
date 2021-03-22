import React, { FC } from 'react';
import { INode } from '~/redux/types';
import styles from '~/containers/lab/LabStats/styles.module.scss';
import { LabHero } from '~/components/lab/LabHero';
import { Group } from '~/components/containers/Group';

interface IProps {
  nodes: Partial<INode>[];
  isLoading: boolean;
}

const empty = [...new Array(5)].map((_, i) => i);

const LabHeroes: FC<IProps> = ({ nodes, isLoading }) => {
  if (isLoading) {
    return (
      <Group className={styles.heroes}>
        {empty.map(i => (
          <LabHero isLoading key={i} />
        ))}
      </Group>
    );
  }

  return (
    <Group className={styles.heroes}>
      {nodes.slice(0, 7).map(node => (
        <LabHero node={node} key={node?.id} />
      ))}
    </Group>
  );
};

export { LabHeroes };
