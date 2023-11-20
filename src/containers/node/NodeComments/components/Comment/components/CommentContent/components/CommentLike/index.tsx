import React, { FC } from 'react';

import classnames from 'classnames';

import { Icon } from '~/components/common/Icon';

import styles from './styles.module.scss';

interface CommentLikeProps {
  className?: string;
  count?: number;
  active?: boolean;
  liked?: boolean;
  onLike?: () => void;
}

const CommentLike: FC<CommentLikeProps> = ({
  className,
  count,
  active,
  liked,
  onLike,
}) => {
  if (!active && !count) {
    return null;
  }

  return (
    <div
      onClick={active ? onLike : undefined}
      className={classnames(styles.likes, className, {
        [styles.liked]: active && liked,
        [styles.active]: active,
      })}
    >
      <div className={styles.icon}>
        <Icon icon={count ? 'heart_full' : 'heart'} size={18} />
      </div>

      {Boolean(count) && <span className={styles.count}>{count}</span>}
    </div>
  );
};
export { CommentLike };
