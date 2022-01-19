import React, { FC } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

export interface PlaceholderProps {
  width?: string;
  height?: number;
  color?: string;
  active?: boolean;
  loading?: boolean;
  className?: string;
}

const Placeholder: FC<PlaceholderProps> = ({
  width = '120px',
  height,
  color,
  active,
  children,
  loading = true,
  className,
}) => {
  return active ? (
    <div
      className={classNames(styles.placeholder, { [styles.loading]: loading }, className)}
      style={{ height, color, width }}
    />
  ) : (
    <>{children}</>
  );
};

export { Placeholder };
