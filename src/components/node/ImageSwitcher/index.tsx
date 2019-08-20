import React, { FC } from 'react';
import * as styles from './styles.scss';

const ImageSwitcher: FC<{}> = () => (
  <div className={styles.wrap}>
    <div className={styles.switcher}>
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
);

export { ImageSwitcher };
