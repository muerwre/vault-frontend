import React, { FC } from 'react';
import * as styles from './styles.scss';

import classNames = require('classnames');

interface IProps {
  height?: number;
  width?: number;
  title?: string;
  is_hero?: boolean;
  is_stamp?: boolean;
}

const Cell: FC<IProps> = ({
  width = 1,
  height = 1,
  title,
  is_hero,
}) => (
  <div
    className={classNames(styles.cell, { is_hero })}
    style={{
      gridRowEnd: `span ${height}`,
      gridColumnEnd: `span ${width}`,
    }}
  >
    { title && <div className={styles.title}>{title}</div> }
  </div>
);

export { Cell };
