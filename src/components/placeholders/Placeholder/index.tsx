import React, { FC } from 'react';
import * as styles from './styles.scss';

interface IProps {
  width?: number;
  height?: number;
  color?: string;
}

const Placeholder: FC<IProps> = ({ width = 120, height, color }) => (
  <div
    className={styles.placeholder}
    style={{ height, color, width }}
  />
);

export { Placeholder };
