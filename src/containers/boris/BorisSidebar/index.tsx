import { FC } from 'react';

import { BorisContacts } from '~/components/boris/BorisContacts';
import { BorisStats } from '~/components/boris/BorisStats';
import { Group } from '~/components/containers/Group';
import { SuperPowersToggle } from '~/containers/auth/SuperPowersToggle';
import styles from '~/layouts/BorisLayout/styles.module.scss';
import { BorisUsageStats } from '~/types/boris';

interface Props {
  isUser: boolean;
  stats: BorisUsageStats;
  isLoading: boolean;
}

const BorisSidebar: FC<Props> = ({ isUser, stats, isLoading }) => (
  <Group className={styles.stats__container}>
    <div className={styles.super_powers}>
      <SuperPowersToggle />
    </div>

    <BorisContacts />

    <div className={styles.stats__wrap}>
      <BorisStats stats={stats} isLoading={isLoading} />
    </div>
  </Group>
);

export { BorisSidebar };
