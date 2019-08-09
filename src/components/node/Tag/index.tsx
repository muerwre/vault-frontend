import React, { FC } from 'react';
import * as styles from './styles.scss';
import { ITag } from '~/redux/types';

import classNames = require('classnames');

interface IProps {
  title: ITag['title'];
  feature?: ITag['feature'];

  is_hoverable?: boolean;
}

const Tag: FC<IProps> = ({
  title,
  feature,

  is_hoverable,
}) => (
  <div className={classNames(styles.tag, feature, { is_hoverable })}>
    <div className={styles.hole} />
    <div className={styles.title}>{title}</div>
  </div>
);

export { Tag };
