import React, { FC } from 'react';
import * as styles from './styles.scss';
import classNames = require("classnames");

interface IProps {
  title: string;
  color?: 'red' | 'blue' | 'green' | 'olive' | 'black';
}

const Tag: FC<IProps> = ({
  title,
  color,
}) => (
  <div className={classNames(styles.tag, color)}>
    <div className={styles.hole} />
    <div className={styles.title}>{title}</div>
  </div>
);

export { Tag };
