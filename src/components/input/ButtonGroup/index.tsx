import React, { HTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

type IProps = HTMLAttributes<HTMLDivElement> & {};

export const ButtonGroup = ({ children, className }: IProps) => (
  <div className={classNames(styles.wrap, className)}>{children}</div>
);
