import React, { FC, useCallback, useState } from 'react';
import classNames from 'classnames';
import styles from './styles.module.scss';
import { Manager, Popper, Reference } from 'react-popper';
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

  return (
    <div
      className={classNames(styles.tag, feature, size, {
        is_hoverable,
        is_editing,
        deletable,
        input: has_input,
        clickable: onClick,
      })}
    >
      <div className={styles.content} onClick={onClick}>
        <div className={styles.hole} />
        <div className={styles.title}>{title}</div>
        {children}
      </div>

      {deletable && (
        <button type="button" className={styles.delete} onClick={onDelete}>
          <Icon icon="close" size={20} />
        </button>
      )}
    </div>
  );
};

export { TagWrapper };
