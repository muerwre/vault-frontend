import * as React from 'react';
import { Header } from "$components/main/Header";

const style = require('./style.scss');

export const MainLayout = ({ children }) => (
  <div className={style.wrapper}>
    <Header />
    {children}
  </div>
);
