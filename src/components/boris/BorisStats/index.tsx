import React, { FC } from 'react';
import { IBorisState } from '~/redux/boris/reducer';
import { BorisStatsGit } from '../BorisStatsGit';

interface IProps {
  stats: IBorisState['stats'];
}

const BorisStats: FC<IProps> = ({ stats }) => {
  return (
    <>
      <BorisStatsGit stats={stats} />
    </>
  );
};

export { BorisStats };
