import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';

interface Props {}

const Row: FC<{ count: number; title: string; icon?: string }> = ({ count, title, icon }) => (
  <div className={styles.row}>
    {icon && (
      <div className={styles.icon}>
        <Icon icon={icon} size={24} />
      </div>
    )}
    <div className={styles.counter}>{count > 999 ? '999+' : count}</div>
    <div className={styles.title}>{title}</div>
  </div>
);

const ProfilePageStats: FC<Props> = () => (
  <div className={styles.wrap}>
    <Row count={9} title="лет в бункере" />
    <Row count={99} title="постов" />
    <Row count={99999} title="комментариев" icon="comment" />
    <Row count={99} title="лайков" icon="heart_full" />
  </div>
);

export { ProfilePageStats };
