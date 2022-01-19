import React, { FC } from 'react';

import { BorisContacts } from '~/components/boris/BorisContacts';
import { BorisStats } from '~/components/boris/BorisStats';
import { BorisSuperpowers } from '~/components/boris/BorisSuperpowers';
import { Group } from '~/components/containers/Group';
import styles from '~/layouts/BorisLayout/styles.module.scss';
import { BorisUsageStats } from '~/types/boris';

interface Props {
  isUser: boolean;
  isTester: boolean;
  stats: BorisUsageStats;
  setBetaTester: (val: boolean) => void;
  isLoading: boolean;
}

const BorisSidebar: FC<Props> = ({ isUser, stats, isLoading, isTester, setBetaTester }) => (
  <Group className={styles.stats__container}>
    <div className={styles.super_powers}>
      {isUser && <BorisSuperpowers active={isTester} onChange={setBetaTester} />}
    </div>

    <BorisContacts />

    <div className={styles.stats__wrap}>
      <BorisStats stats={stats} isLoading={isLoading} />
    </div>
  </Group>
);

export { BorisSidebar };
