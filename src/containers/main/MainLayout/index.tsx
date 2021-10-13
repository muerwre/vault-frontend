import * as React from 'react';
import styles from './styles.module.scss';
import { Header } from '~/components/main/Header';

export const MainLayout = ({ children }) => (
  <div className={styles.wrapper}>
    <div className={styles.content}>
      <Header />
      {children}
    </div>
  </div>
);
