import React, { FC } from 'react';
import { IStatGitRow } from '~/redux/boris/reducer';
import styles from './styles.module.scss';
import { getPrettyDate } from '~/utils/dom';

interface IProps {
  data: Partial<IStatGitRow>;
}

const BorisStatsGitCard: FC<IProps> = ({ data: { timestamp, subject } }) => {
  if (!subject || !timestamp) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.time}>
        {getPrettyDate(new Date(parseInt(`${timestamp}000`)).toISOString())}
      </div>

      <div className={styles.subject}>{subject}</div>
    </div>
  );
};

export { BorisStatsGitCard };
