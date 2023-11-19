import { FC } from 'react';

import { Group } from '~/components/containers/Group';
import { SuperPowersToggle } from '~/containers/auth/SuperPowersToggle';
import { useTelegramAccount } from '~/hooks/auth/useTelegramAccount';
import { BorisUsageStats } from '~/types/boris';

import { BorisContacts } from './components/BorisContacts';
import { BorisStats } from './components/BorisStats';
import styles from './styles.module.scss';

interface Props {
  isUser: boolean;
  stats: BorisUsageStats;
  isLoading: boolean;
}

const BorisSidebar: FC<Props> = ({ isUser, stats, isLoading }) => {
  const { connected, connect } = useTelegramAccount();

  return (
    <Group className={styles.container}>
      <div className={styles.super_powers}>
        <SuperPowersToggle />
      </div>

      <BorisContacts
        canConnectTelegram={isUser && !connected}
        connectTelegram={connect}
      />

      <div className={styles.wrap}>
        <BorisStats stats={stats} isLoading={isLoading} />
      </div>
    </Group>
  );
};

export { BorisSidebar };
