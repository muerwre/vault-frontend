import { FC } from 'react';

import { BorisUsageStats } from '~/types/boris';

import { BorisStatsBackend } from './components/BorisStatsBackend';
import { BorisStatsGit } from './components/BorisStatsGit';

interface IProps {
  stats: BorisUsageStats;
  isLoading: boolean;
}

const BorisStats: FC<IProps> = ({ stats, isLoading }) => {
  return (
    <>
      <BorisStatsBackend stats={stats.backend} isLoading={isLoading} />
      <BorisStatsGit issues={stats.issues} isLoading={isLoading} />
    </>
  );
};

export { BorisStats };
