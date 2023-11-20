import React, { VFC } from 'react';

import { CardProps } from '~/components/common/Card';
import { Filler } from '~/components/common/Filler';

import { BasicCurveChart } from '../BasicCurveChart';
import { StatsCard } from '../StatsCard';

import styles from './styles.module.scss';

interface StatsGraphCardProps extends CardProps {
  title?: string;
  total?: string | number;
  data: number[];
  left?: string | number;
  right?: string | number;
}

const StatsGraphCard: VFC<StatsGraphCardProps> = ({
  total,
  title,
  data,
  left,
  right,
}) => (
  <StatsCard
    title={title}
    total={total}
    background={
      <BasicCurveChart items={data} stroke={'var(--color_primary)'} />
    }
    className={styles.card}
  >
    <div className={styles.content}>
      <span className={styles.legend}>{left}</span>
      <Filler />
      <span className={styles.legend}>{right}</span>
    </div>
  </StatsCard>
);

export { StatsGraphCard };
