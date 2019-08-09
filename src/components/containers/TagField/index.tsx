import React, { FC, HTMLAttributes } from 'react';
import * as styles from './styles.scss';

type IProps = HTMLAttributes<HTMLDivElement> & {}

const TagField: FC<IProps> = ({
  children,
}) => (
  <div className={styles.wrap}>
    {children}
  </div>
);

export { TagField };
