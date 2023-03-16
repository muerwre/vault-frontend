import React, { FC } from 'react';

import classNames from 'classnames';

import { LoaderCircle } from '../LoaderCircle';

import styles from './styles.module.scss';

interface LoaderScreenProps {
  className?: string;
  align?: 'top' | 'middle';
}

const LoaderScreen: FC<LoaderScreenProps> = ({
  className,
  align = 'middle',
}) => (
  <div
    className={classNames(styles.screen, styles[`align-${align}`], className)}
  >
    <LoaderCircle size={32} />
  </div>
);

export { LoaderScreen };
