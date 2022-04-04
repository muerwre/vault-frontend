import React, { FC } from 'react';

import Masonry from 'react-masonry-css';

import styles from './styles.module.scss';

const defaultColumns = {
  default: 2,
  1280: 1,
};

interface ColumnsProps {
  cols?: Record<number, number>;
}

const Columns: FC<ColumnsProps> = ({ children, cols = defaultColumns }) => (
  <Masonry className={styles.wrap} breakpointCols={cols} columnClassName={styles.column}>
    {children}
  </Masonry>
);

export { Columns };
