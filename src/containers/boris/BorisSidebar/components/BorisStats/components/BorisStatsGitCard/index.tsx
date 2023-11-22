import { FC, useMemo } from 'react';

import classNames from 'classnames';

import { GithubIssue } from '~/types/boris';
import { getPrettyDate } from '~/utils/dom';

import styles from './styles.module.scss';

interface Props {
  data: GithubIssue;
}

const stateLabels: Record<GithubIssue['state'], string> = {
  open: 'Ожидает',
  closed: 'Сделано',
};

const BorisStatsGitCard: FC<Props> = ({
  data: { created_at, title, html_url, state },
}) => {
  const date = useMemo(() => getPrettyDate(created_at), [created_at]);

  if (!title || !created_at) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.time}>
        <span className={classNames(styles.icon, styles[state])}>
          {stateLabels[state]}
        </span>
        {date}
      </div>

      <a
        className={styles.subject}
        href={html_url}
        target="_blank"
        rel="noreferrer"
      >
        {title}
      </a>
    </div>
  );
};

export { BorisStatsGitCard };
