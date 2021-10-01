import React, { FC } from 'react';
import styles from './styles.module.scss';

interface Props {}

const Row: FC<{ count: number; title: string }> = ({ count, title }) => (
  <div className={styles.row}>
    <div className={styles.counter}>{count > 999 ? '999+' : count}</div>
    <div className={styles.title}>{title}</div>
  </div>
);

const ProfilePageStats: FC<Props> = () => (
  <div className={styles.wrap}>
    <Row count={9} title="лет в бункере" />
    <Row count={99} title="постов" />
    <Row count={99999} title="комментариев" />
  </div>
);

export { ProfilePageStats };
