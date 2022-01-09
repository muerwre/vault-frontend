import React, { FC } from 'react';
import styles from './styles.module.scss';
import { DivProps } from '~/utils/types';
import classNames from 'classnames';

interface IProps extends DivProps {}

const LabSquare: FC<IProps> = ({ children, ...rest }) => (
  <div className={styles.square}>
    <div {...rest} className={classNames(styles.content, rest.className)}>
      {children}
    </div>
  </div>
);

export { LabSquare };
