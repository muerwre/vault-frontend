import React, { VFC } from 'react';

import classNames from 'classnames';
import {
  addMonths,
  addYears,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from 'date-fns';

import { StatsCard } from '~/components/charts/StatsCard';
import { CardProps } from '~/components/containers/Card';

import styles from './styles.module.scss';

interface StatsCountdownCardProps extends CardProps {
  since: Date;
}

const StatsCountdownCard: VFC<StatsCountdownCardProps> = ({ since, ...props }) => {
  const years = differenceInYears(new Date(), since);
  const months = differenceInMonths(new Date(), addYears(since, years));
  const days = differenceInDays(new Date(), addMonths(addYears(since, years), months));

  return (
    <StatsCard {...props} title="Нам уже" className={classNames(styles.card, props.className)}>
      <div className={styles.content}>
        {years > 0 && (
          <>
            <span className={styles.val}>{years}</span>
            {' лет '}
          </>
        )}

        {months > 0 && (
          <>
            <span className={styles.val}>{months}</span>
            {' мес. '}
          </>
        )}

        {days > 0 && (
          <>
            <span className={styles.val}>{days}</span>
            {' дн. '}
          </>
        )}
      </div>
    </StatsCard>
  );
};

export { StatsCountdownCard };
