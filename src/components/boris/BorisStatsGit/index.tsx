import React, { FC, useMemo } from 'react';
import { GithubIssue } from '~/types/boris';
import styles from './styles.module.scss';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { BorisStatsGitCard } from '../BorisStatsGitCard';

interface IProps {
  issues: GithubIssue[];
  isLoading: boolean;
}

const BorisStatsGit: FC<IProps> = ({ issues, isLoading }) => {
  const open = useMemo(
    () => issues.filter(el => !el.pull_request && el.state === 'open').slice(0, 5),
    [issues]
  );

  const closed = useMemo(
    () => issues.filter(el => !el.pull_request && el.state === 'closed').slice(0, 5),
    [issues]
  );

  if (!issues.length) return null;

  if (isLoading) {
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
        <img src="https://jenkins.vault48.org/api/badges/muerwre/vault-golang/status.svg" alt="" />
      </div>

      {open.map(data => (
        <BorisStatsGitCard data={data} key={data.id} />
      ))}

      {closed.map(data => (
        <BorisStatsGitCard data={data} key={data.id} />
      ))}
    </div>
  );
};

export { BorisStatsGit };
