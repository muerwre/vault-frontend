import React, { VFC } from 'react';

import { BasicCurveChart } from '~/components/charts/BasicCurveChart';
import { StatsCard } from '~/components/charts/StatsCard';
import { CardProps } from '~/components/containers/Card';
import { Filler } from '~/components/containers/Filler';

import styles from './styles.module.scss';

interface StatsGraphCardProps extends CardProps {
  title?: string;
  total?: string | number;
  data: number[];
  left?: string | number;
  right?: string | number;
}

const StatsGraphCard: VFC<StatsGraphCardProps> = ({ total, title, data, left, right }) => (
  <StatsCard title={title} total={total} background={<BasicCurveChart items={data} />}>
    <div className={styles.content}>
      <span>{left}</span>
      <Filler />
      <span>{right}</span>
    </div>
  </StatsCard>
);

export { StatsGraphCard };
