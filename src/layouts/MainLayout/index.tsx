import React from 'react';

import { LoadingProgress } from '~/components/common/LoadingProgress';
import { HeaderSSR } from '~/containers/main/Header/ssr';
import { SidebarRouter } from '~/containers/main/SidebarRouter';

import styles from './styles.module.scss';

export const MainLayout = ({ children }) => (
  <div className={styles.wrapper}>
    <div className={styles.content}>
      <HeaderSSR />

      {children}

      <LoadingProgress />
      <SidebarRouter />
    </div>
  </div>
);
