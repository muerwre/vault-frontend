import React from 'react';

import { LoadingProgress } from '~/components/common/LoadingProgress';
import { HeaderSSR } from '~/containers/main/Header/ssr';

import styles from './styles.module.scss';

export const MainLayout = ({ children }) => (
  <div className={styles.wrapper}>
    <div className={styles.content}>
      <HeaderSSR />

      {children}

      <LoadingProgress />
    </div>
  </div>
);
