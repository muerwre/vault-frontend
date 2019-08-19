import React, { FC } from 'react';
import * as styles from './styles.scss';
import { TEXTS } from '~/constants/texts';

import classNames = require('classnames');

interface IProps {
  height?: number;
  width?: number;
  title?: string;
  is_hero?: boolean;
  is_stamp?: boolean;
  is_text?: boolean;
}

const Cell: FC<IProps> = ({
  width = 1,
  height = 1,
  title,
  is_hero,
  is_text = (Math.random() > 0.8),
}) => (
  <div
    className={
      classNames(
        styles.cell, 
        `vert-${height}`,
        `hor-${width}`,
        { is_text },
      )}
    style={{
      // gridRowEnd: `span ${height}`,
      // gridColumnEnd: `span ${width}`,
    }}
  >
    {is_text && <div className={styles.text}>{TEXTS.LOREM_IPSUM}</div>}
    { title && <div className={styles.title}>{title}</div> }
  </div>
);

export { Cell };
