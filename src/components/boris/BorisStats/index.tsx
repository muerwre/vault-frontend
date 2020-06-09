import React, { FC } from 'react';
import { IBorisState } from '~/redux/boris/reducer';
import { BorisStatsGit } from '../BorisStatsGit';
import { BorisStatsBackend } from '../BorisStatsBackend';

interface IProps {
  stats: IBorisState['stats'];
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
