import React, { FC } from 'react';
import range from 'ramda/es/range';
import classNames from 'classnames';

import * as styles from './styles.scss';

interface IProps {
  total: number;
  current: number;
  loaded?: Record<number, boolean>;
  onChange: (current: number) => void;
}

const ImageSwitcher: FC<IProps> = ({ total, current, onChange, loaded }) => {
  if (total <= 1) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.switcher}>
        {range(0, total).map(item => (
          <div
            className={classNames({ is_active: item === current, is_loaded: loaded[item] })}
            key={item}
            onClick={() => onChange(item)}
          />
        ))}
      </div>
    </div>
  );
};

export { ImageSwitcher };
