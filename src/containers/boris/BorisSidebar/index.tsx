import { FC } from 'react';

import { BorisContacts } from '~/components/boris/BorisContacts';
import { BorisStats } from '~/components/boris/BorisStats';
import { Group } from '~/components/containers/Group';
import { SuperPowersToggle } from '~/containers/auth/SuperPowersToggle';
import { BorisUsageStats } from '~/types/boris';

import styles from './styles.module.scss';

interface Props {
  isUser: boolean;
  stats: BorisUsageStats;
  isLoading: boolean;
}

const BorisSidebar: FC<Props> = ({ isUser, stats, isLoading }) => (
  <Group className={styles.container}>
    <div className={styles.super_powers}>
      <SuperPowersToggle />
    </div>

    <BorisContacts />

    <div className={styles.wrap}>
      <BorisStats stats={stats} isLoading={isLoading} />
    </div>
  </Group>
);

export { BorisSidebar };
