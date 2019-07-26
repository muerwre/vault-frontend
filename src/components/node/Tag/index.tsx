import React, { FC } from 'react';
import * as styles from './styles.scss';
import classNames = require("classnames");
import {ITag} from "~/redux/types";

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
