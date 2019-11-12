import React, { FC } from 'react';
import * as styles from './styles.scss';
import { describeArc } from '~/utils/dom';
import classNames from 'classnames';

interface IProps {
  size?: number;
}

export const LoaderCircle: FC<IProps> = ({ size = 24 }) => (
  <div className={classNames(styles.wrap, 'loader-circle')}>
    <svg className={styles.icon} width={size} height={size}>
      <path d={describeArc(size / 2, size / 2, size / 2, 0, 90)} />
      <path d={describeArc(size / 2, size / 2, size / 2, 180, 270)} />
    </svg>
  </div>
);
