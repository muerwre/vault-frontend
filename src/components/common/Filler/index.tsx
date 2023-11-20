import { FC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

type IProps = HTMLAttributes<HTMLDivElement>;

export const Filler: FC<IProps> = ({ className = '', ...props }) => (
  <div className={classNames(styles.filler, className)} {...props} />
);
