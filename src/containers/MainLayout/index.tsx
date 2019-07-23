import * as React from 'react';
import { SidePane } from "$components/main/SidePane";

const style = require('./style.scss');

export const MainLayout = ({ children }) => (
  <div className={style.wrapper}>
    {
      // <Header />
    }
    {
      <SidePane />
    }
    {children}
  </div>
);
