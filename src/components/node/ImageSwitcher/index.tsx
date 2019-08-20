import React, { FC } from 'react';
import * as styles from './styles.scss';
import range from 'ramda/es/range';
import classNames = require("classnames");

interface IProps {
  total: number;
  current: number;
}

const ImageSwitcher: FC<IProps> = ({ total, current }) => (
  <div className={styles.wrap}>
    <div className={styles.switcher}>
      {
        range(0, total).map((item) => (
          <div className={classNames({ is_active: item === current })} />
        ))
      }
    </div>
  </div>
);

export { ImageSwitcher };
