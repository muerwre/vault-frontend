import * as React from 'react';

import { LoadingProgress } from '~/components/common/LoadingProgress';
import { Header } from '~/containers/main/Header';
import { SidebarRouter } from '~/containers/main/SidebarRouter';

import styles from './styles.module.scss';

export const MainLayout = ({ children }) => (
  <div className={styles.wrapper}>
    <div className={styles.content}>
      <Header />
      {children}
      <LoadingProgress />
      <SidebarRouter />
    </div>
  </div>
);
