import React, { FC } from 'react';
import { Placeholder } from '~/components/placeholders/Placeholder';
import styles from './styles.module.scss';

const StatsRow: FC<{ isLoading: boolean; label: string }> = ({ isLoading, label, children }) => (
  <li className={styles.row}>
    {isLoading ? (
      <>
        <Placeholder active={isLoading} loading className={styles.label} />
        <Placeholder active={isLoading} loading className={styles.value} width="24px" />
      </>
    ) : (
      <>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{children}</div>
      </>
    )}
  </li>
);

export { StatsRow };
