import React, { FC } from 'react';

import classNames from 'classnames';

import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

export type CardProps = DivProps & {
  seamless?: boolean;
};

const Card: FC<CardProps> = ({ className, children, seamless, ...props }) => (
  <div className={classNames(styles.card, className, { seamless })} {...props}>
    {children}
  </div>
);

export { Card };
