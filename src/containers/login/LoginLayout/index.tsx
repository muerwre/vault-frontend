import * as React from 'react';
import { LoginForm } from '~/components/login/LoginForm';
import { Header } from "~/components/main/Header";
import { GodRays } from "~/components/main/GodRays";

import * as styles from './styles.scss';

export const LoginLayout: React.FunctionComponent<{}> = () => (
  <div className={styles.wrapper}>
    <GodRays />
    <div className={styles.header}>
      <Header />
    </div>
    <div className={styles.container}>
      <LoginForm />
    </div>
  </div>
);
