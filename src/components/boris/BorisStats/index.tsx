import React, { FC } from 'react';
import { BorisUsageStats } from '~/types/boris';
import { BorisStatsGit } from '../BorisStatsGit';
import { BorisStatsBackend } from '../BorisStatsBackend';

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
