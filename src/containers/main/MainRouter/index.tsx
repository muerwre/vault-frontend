import React, { FC } from 'react';
import { URLS } from '~/constants/urls';
import { ErrorNotFound } from '~/containers/pages/ErrorNotFound';
import { Redirect, Route, Switch, useLocation } from 'react-router';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectAuthUser } from '~/redux/auth/selectors';
import { ProfileLayout } from '~/layouts/ProfileLayout';
import FlowPage from '~/pages';
import BorisPage from '~/pages/boris';
import NodePage from '~/pages/node/[id]';
import LabPage from '~/pages/lab';

interface IProps {}

const MainRouter: FC<IProps> = () => {
  const { is_user } = useShallowSelect(selectAuthUser);
  const location = useLocation();

  return (
    <Switch location={location}>
      <Route path={URLS.NODE_URL(':id')} component={NodePage} />
      <Route path={URLS.BORIS} component={BorisPage} />
      <Route path={URLS.ERRORS.NOT_FOUND} component={ErrorNotFound} />
      <Route path={URLS.PROFILE_PAGE(':username')} component={ProfileLayout} />

      {is_user && <Route path={URLS.LAB} component={LabPage} />}

      <Route path={URLS.BASE} component={FlowPage} />
      <Redirect to="/" />
    </Switch>
  );
};

export { MainRouter };
