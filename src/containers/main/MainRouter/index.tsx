import React, { FC } from 'react';
import { URLS } from '~/constants/urls';
import { FlowLayout } from '~/containers/flow/FlowLayout';
import { NodeLayout } from '~/containers/node/NodeLayout';
import { BorisLayout } from '~/containers/node/BorisLayout';
import { ErrorNotFound } from '~/containers/pages/ErrorNotFound';
import { ProfilePage } from '~/containers/profile/ProfilePage';
import { Redirect, Route, Switch, useLocation } from 'react-router';

interface IProps {}

const MainRouter: FC<IProps> = () => {
  const location = useLocation();

  return (
    <Switch location={location}>
      <Route exact path={URLS.BASE} component={FlowLayout} />
      <Route path={URLS.NODE_URL(':id')} component={NodeLayout} />
      <Route path={URLS.BORIS} component={BorisLayout} />
      <Route path={URLS.ERRORS.NOT_FOUND} component={ErrorNotFound} />
      <Route path={URLS.PROFILE_PAGE(':username')} component={ProfilePage} />

      <Redirect to="/" />
    </Switch>
  );
};

export { MainRouter };
