import { FC, useCallback } from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/common/Icon';

import styles from './styles.module.scss';

interface Props {
  className?: string;
  size?: string;
  color?: 'primary' | 'danger' | 'info' | 'black' | 'default';
  deletable?: boolean;
  hoverable?: boolean;
  editing?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  title?: string;
}

const TagWrapper: FC<Props> = ({
  className,
  color = 'default',
  children,
  size,
  deletable,
  hoverable,
  editing,
  onClick,
  onDelete,
  title = '',
}) => {
  const canBeDeleted = deletable && !editing;
  const onDeletePress = useCallback(
    (event) => {
      if (!onDelete) {
        return;
      }

      event.stopPropagation();
      onDelete();
    },
    [onDelete],
  );

  return (
    <div
      className={classNames(
        styles.tag,
        size && styles[`size-${size}`],
        styles[`color-${color}`],
        {
          [styles.hoverable]: hoverable,
          [styles.editing]: editing,
          [styles.deletable]: canBeDeleted,
          [styles.clickable]: onClick,
        },
        className,
      )}
      onClick={onClick}
    >
      <div className={styles.hole} />

      <div className={styles.text}>
        <div className={styles.title}>{title}</div>
        {children}
      </div>

      {deletable && (
        <button type="button" className={styles.delete} onClick={onDeletePress}>
          <Icon icon="close" size={12} />
        </button>
      )}
    </div>
  );
};

export { TagWrapper };
