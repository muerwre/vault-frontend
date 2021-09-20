import React, { FC } from 'react';
import styles from '~/layouts/BorisLayout/styles.module.scss';
import { BorisSuperpowers } from '~/components/boris/BorisSuperpowers';
import { BorisContacts } from '~/components/boris/BorisContacts';
import { BorisStats } from '~/components/boris/BorisStats';
import { Group } from '~/components/containers/Group';
import { IUser } from '~/redux/auth/types';
import { BorisUsageStats } from '~/redux/boris/reducer';

interface Props {
  user: IUser;
  isTester: boolean;
  stats: BorisUsageStats;
  setBetaTester: (val: boolean) => void;
}

const BorisSidebar: FC<Props> = ({ user, stats, isTester, setBetaTester }) => (
  <Group className={styles.stats__container}>
    <div className={styles.super_powers}>
      {user.is_user && <BorisSuperpowers active={isTester} onChange={setBetaTester} />}
    </div>

    <BorisContacts />

    <div className={styles.stats__wrap}>
      <BorisStats stats={stats} />
    </div>
  </Group>
);

export { BorisSidebar };
