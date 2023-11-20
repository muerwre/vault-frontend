import { FC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

type IProps = HTMLAttributes<HTMLDivElement> & {
  children: any;
  size: number;
};

const CellGrid: FC<IProps> = ({ children, size, className, ...props }) => (
  <div
    className={classNames(styles.grid, className)}
    style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${size}px, 1fr))` }}
    {...props}
  >
    {children}
  </div>
);

export { CellGrid };
