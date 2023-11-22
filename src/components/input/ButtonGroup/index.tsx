import { HTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

type Props = HTMLAttributes<HTMLDivElement> & {};

export const ButtonGroup = ({ children, className }: Props) => (
  <div className={classNames(styles.wrap, className)}>{children}</div>
);
