import React, { FC, useMemo } from 'react';
import styles from './styles.module.scss';
import { getPrettyDate } from '~/utils/dom';
import { IGithubIssue } from '~/redux/boris/types';
import classNames from 'classnames';

interface IProps {
  data: IGithubIssue;
}

const stateLabels: Record<IGithubIssue['state'], string> = {
  open: 'Ожидает',
  closed: 'Сделано',
};

const BorisStatsGitCard: FC<IProps> = ({ data: { created_at, title, html_url, state } }) => {
  if (!title || !created_at) return null;

  const date = useMemo(() => getPrettyDate(created_at), [created_at]);

  return (
    <div className={styles.wrap}>
      <div className={styles.time}>
        <span className={classNames(styles.icon, styles[state])}>{stateLabels[state]}</span>
        {date}
      </div>

      <a className={styles.subject} href={html_url} target="_blank">
        {title}
      </a>
    </div>
  );
};

export { BorisStatsGitCard };
