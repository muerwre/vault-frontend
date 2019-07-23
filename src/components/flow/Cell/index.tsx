import React, { FC } from 'react';
import * as styles from './styles.scss';

interface IProps {
  height?: number;
  width?: number;
  title?: string;
}

const Cell: FC<IProps> = ({
  width = 1,
  height = 1,
  title,
}) => (
    <div
      className={styles.cell}
      style={{
        gridRowEnd: `span ${height}`,
        gridColumnEnd: `span ${width}`,
      }}
    >
      { title && <div className={styles.title}>{title}</div> }
    </div>
);

export { Cell };
