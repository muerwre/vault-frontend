import React, { FC, useMemo } from 'react';
import { IBorisState } from '~/redux/boris/reducer';
import styles from './styles.module.scss';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { BorisStatsGitCard } from '../BorisStatsGitCard';

interface IProps {
  stats: IBorisState['stats'];
}

const BorisStatsGit: FC<IProps> = ({ stats }) => {
  if (!stats.issues.length) return null;

  const open = useMemo(
    () => stats.issues.filter(el => !el.pull_request && el.state === 'open').slice(0, 5),
    [stats.issues]
  );

  const closed = useMemo(
    () => stats.issues.filter(el => !el.pull_request && el.state === 'closed').slice(0, 5),
    [stats.issues]
  );

  if (stats.is_loading) {
    return (
      <>
        <div className={styles.stats__title}>
          <Placeholder width="50%" />
        </div>

        <Placeholder width="50%" />
        <Placeholder width="100%" />
        <Placeholder width="50%" />
        <Placeholder width="70%" />
        <Placeholder width="60%" />
        <Placeholder width="100%" />
      </>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.stats__title}>
        <span>КОММИТС</span>
        <img src="https://jenkins.vault48.org/api/badges/muerwre/vault-golang/status.svg" />
      </div>

      {closed.map(data => (
        <BorisStatsGitCard data={data} key={data.id} />
      ))}

      {open.map(data => (
        <BorisStatsGitCard data={data} key={data.id} />
      ))}
    </div>
  );
};

export { BorisStatsGit };
