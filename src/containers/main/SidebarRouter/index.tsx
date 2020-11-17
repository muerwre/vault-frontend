import React, { FC } from 'react';
import { Route, Switch } from 'react-router';
import { TagSidebar } from '~/containers/sidebars/TagSidebar';
import { ProfileSidebar } from '~/containers/sidebars/ProfileSidebar';

interface IProps {
  prefix?: string;
}

const SidebarRouter: FC<IProps> = ({ prefix = '' }) => (
  <Switch>
    <Route path={`${prefix}/tag/:tag`} component={TagSidebar} />
    <Route path={`${prefix}/~:username`} component={ProfileSidebar} />
  </Switch>
);

export { SidebarRouter };
