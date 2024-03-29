import { FC } from 'react';

import { Group } from '~/components/common/Group';
import styles from '~/containers/lab/LabStats/styles.module.scss';
import { INode } from '~/types';

import { LabHero } from './components/LabHero';

interface Props {
  nodes: Partial<INode>[];
  isLoading: boolean;
}

const empty = [...new Array(5)].map((_, i) => i);

const LabHeroes: FC<Props> = ({ nodes, isLoading }) => {
  if (isLoading) {
    return (
      <Group className={styles.heroes}>
        {empty.map((i) => (
          <LabHero isLoading key={i} />
        ))}
      </Group>
    );
  }

  return (
    <Group className={styles.heroes}>
      {nodes.slice(0, 10).map((node) => (
        <LabHero node={node} key={node?.id} />
      ))}
    </Group>
  );
};

export { LabHeroes };
