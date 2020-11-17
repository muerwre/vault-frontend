import React, { FC, useCallback, useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { SidebarWrapper } from '~/containers/sidebars/SidebarWrapper';
import { connect } from 'react-redux';
import { selectAuthProfile, selectAuthUser } from '~/redux/auth/selectors';
import pick from 'ramda/es/pick';
import { ProfileSidebarInfo } from '~/components/profile/ProfileSidebarInfo';
import { Filler } from '~/components/containers/Filler';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router';
import * as USER_ACTIONS from '~/redux/auth/actions';
import { ProfileSidebarMenu } from '~/components/profile/ProfileSidebarMenu';
import { useCloseOnEscape } from '~/utils/hooks';
import { Icon } from '~/components/input/Icon';
import { ProfileSidebarSettings } from '~/components/profile/ProfileSidebarSettings';
import classNames from 'classnames';

const mapStateToProps = state => ({
  profile: selectAuthProfile(state),
  user: pick(['id'], selectAuthUser(state)),
});

const mapDispatchToProps = {
  authLoadProfile: USER_ACTIONS.authLoadProfile,
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const ProfileSidebarUnconnected: FC<Props> = ({
  profile: { is_loading, user },
  user: { id },
  authLoadProfile,
}) => {
  const {
    params: { username },
    url,
  } = useRouteMatch<{ username: string }>();

  useEffect(() => {
    authLoadProfile(username);
  }, [username]);

  const history = useHistory();
  const basePath = url.replace(new RegExp(`\/~${username}$`), '');
  const onClose = useCallback(() => history.push(basePath), [basePath]);

  useCloseOnEscape(onClose);

  return (
    <SidebarWrapper>
      <div className={styles.close} onClick={onClose}>
        <Icon icon="close" size={32} />
      </div>

      <Switch>
        <Route path={`${url}/settings`} component={ProfileSidebarSettings} />
      </Switch>

      <div className={classNames(styles.wrap, styles.secondary)}>
        <ProfileSidebarInfo is_loading={is_loading} user={user} />
        <ProfileSidebarMenu path={url} />
        <Filler />
      </div>
    </SidebarWrapper>
  );
};

const ProfileSidebar = connect(mapStateToProps, mapDispatchToProps)(ProfileSidebarUnconnected);

export { ProfileSidebar };
