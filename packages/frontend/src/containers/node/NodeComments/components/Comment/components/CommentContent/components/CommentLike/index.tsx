import { FC } from 'react';

import classnames from 'classnames';
import { HeartIcon } from 'lucide-react';

import { HeartFilledIcon } from '~/components/icons';

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
        {count ? <HeartFilledIcon size={16} /> : <HeartIcon size={16} />}
      </div>

      {Boolean(count) && <span className={styles.count}>{count}</span>}
    </div>
  );
};
export { CommentLike };
