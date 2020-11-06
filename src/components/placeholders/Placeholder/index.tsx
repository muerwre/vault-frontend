import React, { FC } from 'react';
import styles from './styles.module.scss';

interface IProps {
  width?: string;
  height?: number;
  color?: string;
}

const Placeholder: FC<IProps> = ({ width = '120px', height, color }) => (
  <div className={styles.placeholder} style={{ height, color, width }} />
);

export { Placeholder };
