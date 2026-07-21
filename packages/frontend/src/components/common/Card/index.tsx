import { FC } from 'react';

import classNames from 'classnames';

import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

export type CardProps = DivProps & {
  seamless?: boolean;
  elevation?: -1 | 0 | 1;
};

const Card: FC<CardProps> = ({
  className,
  children,
  seamless,
  elevation = 1,
  ...props
}) => (
  <div
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
);

export { Card };
