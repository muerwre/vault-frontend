import React, { VFC } from 'react';

import classNames from 'classnames';
import { addYears, differenceInMonths, differenceInYears } from 'date-fns';

import { CardProps } from '~/components/common/Card';

import { StatsCard } from '../StatsCard';

import styles from './styles.module.scss';

interface StatsCountdownCardProps extends CardProps {
  since: Date;
}

const StatsCountdownCard: VFC<StatsCountdownCardProps> = ({
  since,
  ...props
}) => {
  const years = differenceInYears(new Date(), since);
  const months = differenceInMonths(new Date(), addYears(since, years));

  return (
    <StatsCard
      {...props}
      title="Нам уже"
      className={classNames(styles.card, props.className)}
    >
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
            {' мес '}
          </>
        )}
      </div>
    </StatsCard>
  );
};

export { StatsCountdownCard };
