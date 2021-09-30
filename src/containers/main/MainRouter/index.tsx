import React, { FC } from 'react';
import { URLS } from '~/constants/urls';
import { FlowLayout } from '~/layouts/FlowLayout';
import { NodeLayout } from '~/layouts/NodeLayout';
import { BorisLayout } from '~/layouts/BorisLayout';
import { ErrorNotFound } from '~/containers/pages/ErrorNotFound';
import { Redirect, Route, Switch, useLocation } from 'react-router';
import { LabLayout } from '~/layouts/LabLayout';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectAuthUser } from '~/redux/auth/selectors';
import { ProfileLayout } from '~/layouts/ProfileLayout';

interface IProps {}

const MainRouter: FC<IProps> = () => {
  const { is_user } = useShallowSelect(selectAuthUser);
  const location = useLocation();

  return (
    <Switch location={location}>
      <Route path={URLS.NODE_URL(':id')} component={NodeLayout} />
      <Route path={URLS.BORIS} component={BorisLayout} />
      <Route path={URLS.ERRORS.NOT_FOUND} component={ErrorNotFound} />
      <Route path={URLS.PROFILE_PAGE(':username')} component={ProfileLayout} />

      {is_user && <Route path={URLS.LAB} component={LabLayout} />}

      <Route path={URLS.BASE} component={FlowLayout} />
      <Redirect to="/" />
    </Switch>
  );
};

export { MainRouter };
