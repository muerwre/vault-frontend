import React, { HTMLAttributes } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';

type IProps = HTMLAttributes<HTMLDivElement> & {};

export const ButtonGroup = ({ children, className }: IProps) => (
  <div className={classNames(styles.wrap, className)}>{children}</div>
);
