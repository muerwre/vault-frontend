import React, { FC } from 'react';
import { URLS } from '~/constants/urls';
import { ErrorNotFound } from '~/containers/pages/ErrorNotFound';
import { Redirect, Route, Switch, useLocation } from 'react-router';
import { ProfileLayout } from '~/layouts/ProfileLayout';
import FlowPage from '~/pages';
import BorisPage from '~/pages/boris';
import NodePage from '~/pages/node/[id]';
import LabPage from '~/pages/lab';
import { useAuth } from '~/hooks/auth/useAuth';

interface IProps {}

const MainRouter: FC<IProps> = () => {
  const { isUser } = useAuth();
  const location = useLocation();

  return (
    <Switch location={location}>
      <Route path={URLS.NODE_URL(':id')} component={NodePage} />
      <Route path={URLS.BORIS} component={BorisPage} />
      <Route path={URLS.ERRORS.NOT_FOUND} component={ErrorNotFound} />
      <Route path={URLS.PROFILE_PAGE(':username')} component={ProfileLayout} />

      {isUser && <Route path={URLS.LAB} component={LabPage} />}

      <Route path={URLS.BASE} component={FlowPage} />
      <Redirect to="/" />
    </Switch>
  );
};

export { MainRouter };
