import { FC } from 'react';

import { BorisUsageStats } from '~/types/boris';

import { BorisStatsBackend } from './components/BorisStatsBackend';
import { BorisStatsGit } from './components/BorisStatsGit';

interface Props {
  stats: BorisUsageStats;
  isLoading: boolean;
}

const BorisStats: FC<Props> = ({ stats, isLoading }) => {
  return (
    <>
      <BorisStatsBackend stats={stats.backend} isLoading={isLoading} />
      <BorisStatsGit issues={stats.issues} isLoading={isLoading} />
    </>
  );
};

export { BorisStats };
