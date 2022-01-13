import * as React from 'react';
import styles from './styles.module.scss';
import { Header } from '~/containers/main/Header';
import { SidebarRouter } from '~/containers/main/SidebarRouter';

export const MainLayout = ({ children }) => (
  <div className={styles.wrapper}>
    <div className={styles.content}>
      <Header />
      {children}
      <SidebarRouter />
    </div>
  </div>
);
