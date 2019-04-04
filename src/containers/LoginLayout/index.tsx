import * as React from 'react';
import { LoginForm } from '$components/login/LoginForm';
import { Header } from "$components/main/Header";

const style = require('./style.scss');

export const LoginLayout: React.FunctionComponent<{}> = () => (
  <div className={style.wrapper}>
    <div className={style.header}>
      <Header />
    </div>
    <div className={style.container}>
      <LoginForm />
    </div>
  </div>
);
