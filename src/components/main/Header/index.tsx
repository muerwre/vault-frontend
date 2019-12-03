import React, { FC, useCallback, memo, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { push as historyPush } from 'connected-react-router';
import { Link } from 'react-router-dom';
import { Logo } from '~/components/main/Logo';

import { Filler } from '~/components/containers/Filler';
import { selectUser } from '~/redux/auth/selectors';
import { Group } from '~/components/containers/Group';
import { DIALOGS } from '~/redux/modal/constants';
import pick from 'ramda/es/pick';
import path from 'ramda/es/path';
import { UserButton } from '../UserButton';
import { Notifications } from '../Notifications';
import { URLS } from '~/constants/urls';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

import * as style from './style.scss';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import * as AUTH_ACTIONS from '~/redux/auth/actions';

const mapStateToProps = state => ({
  user: pick(['username', 'is_user', 'photo'])(selectUser(state)),
  pathname: path(['router', 'location', 'pathname'], state),
});

const mapDispatchToProps = {
  push: historyPush,
  showDialog: MODAL_ACTIONS.modalShowDialog,
  authLogout: AUTH_ACTIONS.authLogout,
  authOpenProfile: AUTH_ACTIONS.authOpenProfile,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const HeaderUnconnected: FC<IProps> = memo(
  ({ user, user: { is_user }, showDialog, pathname, authLogout, authOpenProfile }) => {
    const [is_scrolled, setIsScrolled] = useState(false);

    const onLogin = useCallback(() => showDialog(DIALOGS.LOGIN), [showDialog]);

    const onScroll = useCallback(() => {
      const active = window.scrollY > 32;

      if (active !== is_scrolled) setIsScrolled(active);
    }, [is_scrolled, setIsScrolled]);

    useEffect(() => {
      onScroll();
    }, []);

    useEffect(() => {
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }, [onScroll]);

    return createPortal(
      <div className={classNames(style.wrap, { [style.is_scrolled]: is_scrolled })}>
        <div className={style.container}>
          <Logo />

          <Filler />

          <div className={style.plugs}>
            <Link
              className={classNames(style.item, { [style.is_active]: pathname === URLS.BASE })}
              to={URLS.BASE}
            >
              ФЛОУ
            </Link>

            <Link
              className={classNames(style.item, { [style.is_active]: pathname === URLS.BORIS })}
              to={URLS.BORIS}
            >
              БОРИС
            </Link>

            {is_user && (
              <div className={style.item}>
                <Notifications />
              </div>
            )}
          </div>

          {is_user && (
            <UserButton user={user} onLogout={authLogout} authOpenProfile={authOpenProfile} />
          )}

          {!is_user && (
            <Group horizontal className={style.user_button} onClick={onLogin}>
              <div>ВДОХ</div>
            </Group>
          )}
        </div>
      </div>,
      document.body
    );
  }
);

const Header = connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderUnconnected);

export { Header };
