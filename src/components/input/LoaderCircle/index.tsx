import React, { FC } from 'react';
import * as styles from './styles.scss';
import { Icon } from '../Icon';
import { describeArc } from '~/utils/dom';

interface IProps {
  size?: number;
}

export const LoaderCircle: FC<IProps> = ({ size = 24 }) => (
  <div className={styles.wrap}>
    <svg className={styles.icon} width={size} height={size}>
      <path d={describeArc(size / 2, size / 2, size / 2, 0, 90)} />
      <path d={describeArc(size / 2, size / 2, size / 2, 180, 270)} />
    </svg>
  </div>
);
