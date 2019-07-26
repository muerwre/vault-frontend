import * as React from 'react';
import { SidePane } from "~/components/main/SidePane";
import * as styles from './styles.scss';

export const MainLayout = ({ children }) => {

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        {children}
      </div>

      <SidePane />
    </div>
  );
};
