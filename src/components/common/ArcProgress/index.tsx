import { FC } from 'react';

import { describeArc } from '~/utils/dom';

import styles from './styles.module.scss';

interface IProps {
  size: number;
  progress?: number;
}

export const ArcProgress: FC<IProps> = ({ size, progress = 0 }) => (
  <svg className={styles.icon} width={size} height={size}>
    <path
      d={describeArc(
        size / 2,
        size / 2,
        size / 2 - 2,
        360 * (1 - progress),
        360,
      )}
    />
  </svg>
);
