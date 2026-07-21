import { FC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

type Props = HTMLAttributes<HTMLDivElement>;

export const Filler: FC<Props> = ({ className = '', ...props }) => (
  <div className={classNames(styles.filler, className)} {...props} />
);
