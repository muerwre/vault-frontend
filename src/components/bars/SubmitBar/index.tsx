import React, { FC, useCallback, useState } from 'react';
import { Icon } from '~/components/input/Icon';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { useRouteMatch } from 'react-router';
import styles from './styles.module.scss';

interface Props {
  isLab?: boolean;
}

const SubmitBar: FC<Props> = ({ isLab }) => {
  const { url } = useRouteMatch();
  const [focused, setFocused] = useState(false);

  const onFocus = useCallback(() => setFocused(true), [setFocused]);
  const onBlur = useCallback(() => setFocused(false), [setFocused]);

  return (
    <div className={classNames(styles.wrap, { [styles.lab]: isLab })}>
      <div className={classNames(styles.panel, { [styles.active]: focused })}>
        <Link to={`${url}/create/image`} className={styles.link}>
          <Icon icon="image" size={32} />
        </Link>

        <Link to={`${url}/create/text`} className={styles.link}>
          <Icon icon="text" size={32} />
        </Link>

        <Link to={`${url}/create/video`} className={styles.link}>
          <Icon icon="video" size={32} />
        </Link>

        <Link to={`${url}/create/audio`} className={styles.link}>
          <Icon icon="audio" size={32} />
        </Link>
      </div>

      <button className={styles.button} onFocus={onFocus} onBlur={onBlur} type="button">
        <Icon icon="plus" />
      </button>
    </div>
  );
};

export { SubmitBar };
