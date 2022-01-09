import * as React from 'react';
import styles from './styles.module.scss';
import { Header } from '~/containers/main/Header';

export const MainLayout = ({ children }) => (
  <div className={styles.wrapper}>
    <div className={styles.content}>
      <Header />
      {children}
    </div>
  </div>
);
