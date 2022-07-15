import React, { FC, memo, useMemo } from 'react';

import { differenceInDays, formatDistance } from 'date-fns';
import ru from 'date-fns/locale/ru';

import styles from './styles.module.scss';

interface CommentDistanceProps {
  firstDate?: Date;
  secondDate?: Date;
}

const CommentDistance: FC<CommentDistanceProps> = memo(({ firstDate, secondDate }) => {
  const distance = useMemo(() => {
    if (!firstDate || !secondDate) {
      return undefined;
    }

    if (differenceInDays(secondDate, firstDate) < 30) {
      return undefined;
    }

    return formatDistance(secondDate, firstDate, {
      locale: ru,
      addSuffix: false,
    });
  }, []);

  if (!distance) {
    return null;
  }

  return <div className={styles.bar}>прошло {distance}</div>;
});

export { CommentDistance };
