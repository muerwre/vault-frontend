import React, { FC, useCallback } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { IAuthState } from '~/redux/auth/types';

interface IProps {}

const Tabs: FC<IProps> = ({ children }) => {
  return <div className={styles.wrap}>{children}</div>;
};

export { Tabs };
