import { FC, forwardRef } from 'react';

import classNames from 'classnames';

import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

export type CardProps = Omit<DivProps, 'ref'> & {
  seamless?: boolean;
  elevation?: -1 | 0 | 1;
};

/** Forwards its ref to the div, for callers that measure the card. */
const CardBase = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, seamless, elevation = 1, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames(
        styles.card,
        { seamless },
        styles[`elevation-${elevation}`],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

type RowProps = DivProps & {
  /** Lays its `Card.Column`s side by side where they fit, stacked otherwise. */
  columns?: boolean;
  /** No padding of its own, as for a row of columns that pad themselves. */
  seamless?: boolean;
};

/**
 * A section of a seamless card, split from its neighbours by a ridge. The
 * first and last rows follow the card's rounded corners.
 */
const Row: FC<RowProps> = ({
  className,
  children,
  columns,
  seamless,
  ...props
}) => (
  <div
    className={classNames(
      styles.row,
      {
        [styles.row_seamless]: seamless || columns,
        [styles.row_columns]: columns,
      },
      className,
    )}
    {...props}
  >
    {columns ? <div className={styles.columns}>{children}</div> : children}
  </div>
);

/** A column of a `Card.Row` with `columns`, split from the others by a ridge. */
const Column: FC<DivProps> = ({ className, children, ...props }) => (
  <div className={classNames(styles.column, className)} {...props}>
    {children}
  </div>
);

const Card = Object.assign(CardBase, { Row, Column });

export { Card };
