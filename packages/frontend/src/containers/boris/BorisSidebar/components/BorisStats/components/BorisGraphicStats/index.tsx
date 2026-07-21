import { VFC } from 'react';

import { StatsGraphCard } from '../StatsGraphCard';

import styles from './styles.module.scss';

interface BorisGraphicStatsProps {
  totalNodes: number;
  nodesByMonth: number[];
  totalComments: number;
  commentsByMonth: number[];
}

const BorisGraphicStats: VFC<BorisGraphicStatsProps> = ({
  totalComments,
  commentsByMonth,
  totalNodes,
  nodesByMonth,
}) => {
  const year = new Date().getFullYear();

  return (
    <div className={styles.group}>
      <StatsGraphCard
        title="Посты"
        total={totalNodes}
        data={nodesByMonth}
        className={styles.card}
        left={year - 1}
        right={year}
      />

      <StatsGraphCard
        title="Комменты"
        total={totalComments}
        data={commentsByMonth}
        className={styles.card}
        left={year - 1}
        right={year}
      />
    </div>
  );
};

export { BorisGraphicStats };
