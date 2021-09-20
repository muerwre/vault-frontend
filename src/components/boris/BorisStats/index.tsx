import React, { FC } from 'react';
import { BorisUsageStats, IBorisState } from '~/redux/boris/reducer';
import { BorisStatsGit } from '../BorisStatsGit';
import { BorisStatsBackend } from '../BorisStatsBackend';

interface IProps {
  stats: BorisUsageStats;
}

const BorisStats: FC<IProps> = ({ stats }) => {
  return (
    <>
      <BorisStatsBackend stats={stats} />
      <BorisStatsGit stats={stats} />
    </>
  );
};

export { BorisStats };
