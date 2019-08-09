import * as React from 'react';
import { SidePane } from '~/components/main/SidePane';
import * as styles from './styles.scss';
import { Header } from '~/components/main/Header';

export const MainLayout = ({ children }) => (
  <div className={styles.wrapper}>
    <Header />

    <div className={styles.content}>
      {children}
    </div>
  </div>
);
