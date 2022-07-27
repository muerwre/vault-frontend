import React, { FC, useCallback } from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/input/Icon';

import styles from './styles.module.scss';

interface IProps {
  feature?: string;
  size?: string;
  deletable?: boolean;
  hoverable?: boolean;
  editing?: boolean;
  hasInput?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  title?: string;
}

const TagWrapper: FC<IProps> = ({
  children,
  feature,
  size,
  deletable,
  hoverable,
  editing,
  hasInput,
  onClick,
  onDelete,
  title = '',
}) => {
  const canBeDeleted = deletable && !editing && !hasInput;
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
        is_hoverable: hoverable,
        is_editing: editing,
        deletable: canBeDeleted,
        input: hasInput,
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
