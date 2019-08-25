import React, { FC } from 'react';
import { ImageSwitcher } from '../ImageSwitcher';
import * as styles from './styles.scss';

interface IProps {}

const NodeImageBlock: FC<IProps> = ({}) => (
  <div>
    <ImageSwitcher total={5} current={2} />

    <div className={styles.image_container}>
      <img
        className={styles.image}
        src="http://37.192.131.144/full/attached/2019/08/e4fb2a1d0a2e20d499aaa1f5f83a7115.jpg"
        alt=""
      />
    </div>
  </div>
);

export { NodeImageBlock };
