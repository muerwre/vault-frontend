import React, { FC } from 'react';
import range from 'ramda/es/range';
import * as styles from './styles.scss';

import classNames = require('classnames');

interface IProps {
  total: number;
  current: number;
  onChange: (current: number) => void;
}

const ImageSwitcher: FC<IProps> = ({ total, current, onChange }) => (
  <div className={styles.wrap}>
    <div className={styles.switcher}>
      {range(0, total).map(item => (
        <div
          className={classNames({ is_active: item === current })}
          key={item}
          onClick={() => onChange(item)}
        />
      ))}
    </div>
  </div>
);

export { ImageSwitcher };
