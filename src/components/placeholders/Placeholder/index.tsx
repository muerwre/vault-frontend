import React, { FC } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';

export interface PlaceholderProps {
  width?: string;
  height?: number;
  color?: string;
  active?: boolean;
  loading?: boolean;
}

const Placeholder: FC<PlaceholderProps> = ({
  width = '120px',
  height,
  color,
  active,
  children,
  loading = true,
}) => {
  return active ? (
    <div
      className={classNames(styles.placeholder, { [styles.loading]: loading })}
      style={{ height, color, width }}
    />
  ) : (
    <>{children}</>
  );
};

export { Placeholder };
