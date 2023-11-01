import React, { FC } from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/input/Icon';

import styles from './styles.module.scss';

interface NodeLikeButtonProps {
  active: boolean;
  count?: number;
  className?: string;

  onClick: () => void;
}

const NodeLikeButton: FC<NodeLikeButtonProps> = ({
  className,
  active,
  count,
  onClick,
}) => (
  <div
    className={classNames(styles.like, className, {
      [styles.is_liked]: active,
    })}
  >
    {count ? (
      <Icon icon="heart_full" size={24} onClick={onClick} />
    ) : (
      <Icon icon="heart" size={24} onClick={onClick} />
    )}

    {!!count && count > 0 && <div className={styles.count}>{count}</div>}
  </div>
);

export { NodeLikeButton };
