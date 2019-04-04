import * as React from 'react';
import { LoginForm } from '$components/login/LoginForm';
import { MainLayout } from "$containers/MainLayout";

const style = require('./style.scss');

export const LoginLayout: React.FunctionComponent<{}> = () => (
  <MainLayout>
    <div className="default_container">
      <LoginForm />
    </div>
  </MainLayout>
);
