import React, { FC } from 'react';

import { BorisUsageStats } from '~/types/boris';

import { BorisStatsBackend } from '../BorisStatsBackend';
import { BorisStatsGit } from '../BorisStatsGit';

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
