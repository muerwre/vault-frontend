import React, { FC } from 'react';
import { Route, Switch } from 'react-router';
import { TagSidebar } from '~/containers/sidebars/TagSidebar';

interface IProps {
  prefix?: string;
}

const SidebarRouter: FC<IProps> = ({ prefix = '' }) => (
  <Switch>
    <Route path={`${prefix}/tag/:tag`} component={TagSidebar} />
  </Switch>
);

export { SidebarRouter };
