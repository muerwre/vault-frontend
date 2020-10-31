import React, { FC } from 'react';
import classNames from 'classnames';
import styles from './styles.module.scss';

interface IProps {
  feature?: string;
  size?: string;
  is_hoverable?: boolean;
  is_editing?: boolean;
  has_input?: boolean;
  onClick?: () => void;
  title?: string;
}

const TagWrapper: FC<IProps> = ({
  children,
  feature,
  size,
  is_hoverable,
  is_editing,
  has_input,
  onClick,
  title = '',
}) => (
  <div
    className={classNames(styles.tag, feature, size, {
      is_hoverable,
      is_editing,
      input: has_input,
      clickable: onClick,
    })}
    onClick={onClick}
  >
    <div className={styles.hole} />
    <div className={styles.title}>{title}</div>
    {children}
  </div>
);

export { TagWrapper };
