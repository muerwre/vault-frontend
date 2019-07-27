import React, { FC } from 'react';
import classNames from 'classnames';
import * as styles from './styles.scss';

type IProps = React.HTMLAttributes<HTMLDivElement> & {
  horizontal?: boolean;
  vertical?: boolean;
  columns?: string;
  rows?: string;
  size?: string;
  square?: boolean;
  gap?: number;
};

const Grid: FC<IProps> = ({
  children,
  className = '',
  horizontal = false,
  vertical = false,
  square = false,
  size = 'auto',
  style = {},
  columns = 'auto',
  rows = 'auto',
  gap = 20,
  ...props
}) => (
  <div
    className={classNames(
      styles.grid,
      className,
      {
        [styles.horizontal]: horizontal,
        [styles.vertical]: !horizontal,
        [styles.square]: square,
      },
    )}
    style={{
      ...style,
      gridTemplateColumns: square ? `repeat(auto-fill, ${(columns !== 'auto' && columns) || size})` : columns,
      gridTemplateRows: square ? `repeat(auto-fill, ${(rows !== 'auto' && rows) || size})` : rows,
      gridAutoRows: rows,
      gridAutoColumns: columns,
      gridRowGap: gap,
      gridColumnGap: gap,
    }}
    {...props}
  >
    {children}
  </div>
);

export { Grid };