import * as React from 'react';
import * as styles from './styles.scss';
import { Header } from '~/components/main/Header';

export const MainLayout = ({ children }) => (
  <div className={styles.wrapper}>
    <div className={styles.content}>
      <Header />

      {children}
    </div>
  </div>
);
