import * as React from 'react';
import { SidePane } from "~/components/main/SidePane";
import * as styles from './styles.scss';
import { useRef } from "react";

export const MainLayout = ({ children }) => {
  const container = useRef(null);

  return (
    <div className={styles.wrapper}>
      <div className={styles.content} ref={container}>
        {children}
      </div>

      <SidePane container={container} />
    </div>
  );
};
