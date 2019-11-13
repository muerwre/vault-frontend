import React, { FC, useCallback, memo } from 'react';
import { connect } from 'react-redux';
import { push as historyPush } from 'connected-react-router';
import { Link } from 'react-router-dom';
import { Logo } from '~/components/main/Logo';

import * as style from './style.scss';
import { Filler } from '~/components/containers/Filler';
import { selectUser } from '~/redux/auth/selectors';
import { Group } from '~/components/containers/Group';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { DIALOGS } from '~/redux/modal/constants';
import { pick } from 'ramda';
import { UserButton } from '../UserButton';
import { Icon } from '~/components/input/Icon';
import { Notifications } from '../Notifications';
import { URLS } from '~/constants/urls';

const mapStateToProps = state => ({
  user: pick(['username', 'is_user', 'photo'])(selectUser(state)),
});

const mapDispatchToProps = {
  push: historyPush,
  showDialog: MODAL_ACTIONS.modalShowDialog,
  authLogout: AUTH_ACTIONS.authLogout,
  authOpenProfile: AUTH_ACTIONS.authOpenProfile,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const HeaderUnconnected: FC<IProps> = memo(
  ({ user, user: { username, is_user }, showDialog, authLogout, authOpenProfile }) => {
    const onLogin = useCallback(() => showDialog(DIALOGS.LOGIN), [showDialog]);
    const onProfileClick = useCallback(() => authOpenProfile(username), [authOpenProfile, user]);

    return (
      <div className={style.container}>
        <Logo />

        <Filler />

        {is_user && (
          <div className={style.plugs}>
            <Link className={style.item} to={URLS.BASE}>
              FLOW
            </Link>

            <Link className={style.item} to={URLS.BORIS}>
              BORIS
            </Link>

            <div className={style.item}>
              <Notifications />
            </div>
          </div>
        )}

        {is_user && (
          <UserButton user={user} onLogout={authLogout} onProfileClick={onProfileClick} />
        )}

        {!is_user && (
          <Group horizontal className={style.user_button} onClick={onLogin}>
            <div>ВДОХ</div>
          </Group>
        )}
      </div>
    );
  }
);

const Header = connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderUnconnected);

export { Header };
