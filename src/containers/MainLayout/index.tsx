import * as React from 'react';
import { SidePane } from "~/components/main/SidePane";
import { Header } from "~/components/main/Header";

import * as styles from './styles.scss';

export const MainLayout = ({ children }) => (
  <div className={styles.wrapper}>
    {
      // <Header />
    }
    {
      <SidePane />
    }
    {children}
  </div>
);
