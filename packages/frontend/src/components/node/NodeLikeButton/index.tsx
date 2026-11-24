import { FC } from 'react';

import classNames from 'classnames';
import { HeartIcon } from 'lucide-react';

import { HeartFilledIcon } from '~/components/icons';

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
      <HeartFilledIcon size={22} onClick={onClick} />
    ) : (
      <HeartIcon size={22} onClick={onClick} />
    )}

    {!!count && count > 0 && <div className={styles.count}>{count}</div>}
  </div>
);

export { NodeLikeButton };
