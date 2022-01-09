import React, { FC, useCallback } from 'react';
import classNames from 'classnames';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';

interface IProps {
  feature?: string;
  size?: string;
  is_deletable?: boolean;
  is_hoverable?: boolean;
  is_editing?: boolean;
  has_input?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  title?: string;
}

const TagWrapper: FC<IProps> = ({
  children,
  feature,
  size,
  is_deletable,
  is_hoverable,
  is_editing,
  has_input,
  onClick,
  onDelete,
  title = '',
}) => {
  const deletable = is_deletable && !is_editing && !has_input;
  const onDeletePress = useCallback(
    event => {
      if (!onDelete) {
        return;
      }

      event.stopPropagation();
      onDelete();
    },
    [onDelete]
  );

  return (
    <div
      className={classNames(styles.tag, feature, size, {
        is_hoverable,
        is_editing,
        deletable,
        input: has_input,
        clickable: onClick,
      })}
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
