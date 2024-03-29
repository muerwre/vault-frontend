import { FC } from 'react';

import { Redirect, Route, Switch, useLocation } from 'react-router';

import { URLS } from '~/constants/urls';
import { useAuth } from '~/hooks/auth/useAuth';
import { ProfileLayout } from '~/layouts/ProfileLayout';
import FlowPage from '~/pages';
import BorisPage from '~/pages/boris';
import LabPage from '~/pages/lab';
import NodePage from '~/pages/node/[id]';

interface Props {}

const MainRouter: FC<Props> = () => {
  const { isUser } = useAuth();
  const location = useLocation();

  return (
    <Switch location={location}>
      <Route path={URLS.NODE_URL(':id')} component={NodePage} />
      <Route path={URLS.BORIS} component={BorisPage} />
      <Route path={URLS.PROFILE_PAGE(':username')} component={ProfileLayout} />

      {isUser && <Route path={URLS.LAB} component={LabPage} />}

      <Route path={URLS.BASE} component={FlowPage} />
      <Redirect to="/" />
    </Switch>
  );
};

export { MainRouter };
