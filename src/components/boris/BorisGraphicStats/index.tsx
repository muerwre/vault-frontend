import React, { VFC } from 'react';

import { parseISO } from 'date-fns/esm';

import { BasicCurveChart } from '~/components/charts/BasicCurveChart';
import { StatsCard } from '~/components/charts/StatsCard';
import { StatsCountdownCard } from '~/components/charts/StatsCountdownCard';
import { foundationDate } from '~/constants/boris/constants';

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
  return (
    <div className={styles.group}>
      <StatsCard
        background={<BasicCurveChart items={nodesByMonth} />}
        title="Посты"
        total={totalNodes}
        className={styles.card}
      />

      <StatsCard
        background={<BasicCurveChart items={commentsByMonth} />}
        title="Комментарии"
        total={totalComments}
        className={styles.card}
      />

      <StatsCountdownCard since={parseISO(foundationDate)} className={styles.card} />
    </div>
  );
};

export { BorisGraphicStats };
