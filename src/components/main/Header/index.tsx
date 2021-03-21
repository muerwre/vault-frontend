import React, { FC, useCallback, memo, useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { push as historyPush } from 'connected-react-router';
import { Link } from 'react-router-dom';
import { Logo } from '~/components/main/Logo';

import { Filler } from '~/components/containers/Filler';
import { selectUser, selectAuthUpdates } from '~/redux/auth/selectors';
import { Group } from '~/components/containers/Group';
import { DIALOGS } from '~/redux/modal/constants';
import { pick } from 'ramda';
import { path } from 'ramda';
import { UserButton } from '../UserButton';
import { Notifications } from '../Notifications';
import { URLS } from '~/constants/urls';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

import styles from './styles.module.scss';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { IState } from '~/redux/store';
import isBefore from 'date-fns/isBefore';
import { Superpower } from '~/components/boris/Superpower';

const mapStateToProps = (state: IState) => ({
  user: pick(['username', 'is_user', 'photo', 'last_seen_boris'])(selectUser(state)),
  updates: pick(['boris_commented_at'])(selectAuthUpdates(state)),
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
  ({
    user,
    user: { is_user, last_seen_boris },
    showDialog,
    pathname,
    updates: { boris_commented_at },
    authLogout,
    authOpenProfile,
  }) => {
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

    const hasBorisUpdates = useMemo(
      () =>
        is_user &&
        boris_commented_at &&
        (!last_seen_boris || isBefore(new Date(last_seen_boris), new Date(boris_commented_at))),
      [boris_commented_at, last_seen_boris]
    );

    return createPortal(
      <div className={classNames(styles.wrap, { [styles.is_scrolled]: is_scrolled })}>
        <div className={styles.container}>
          <Logo />

          <Filler />

          <div className={styles.plugs}>
            <Link
              className={classNames(styles.item, { [styles.is_active]: pathname === URLS.BASE })}
              to={URLS.BASE}
            >
              ФЛОУ
            </Link>

            <Superpower>
              <Link
                className={classNames(styles.item, { [styles.is_active]: pathname === URLS.BASE })}
                to={URLS.LAB}
              >
                ЛАБ
              </Link>
            </Superpower>

            <Link
              className={classNames(styles.item, {
                [styles.is_active]: pathname === URLS.BORIS,
                [styles.has_dot]: hasBorisUpdates,
              })}
              to={URLS.BORIS}
            >
              БОРИС
            </Link>

            {is_user && (
              <div className={styles.item}>
                <Notifications />
              </div>
            )}
          </div>

          {is_user && (
            <UserButton user={user} onLogout={authLogout} authOpenProfile={authOpenProfile} />
          )}

          {!is_user && (
            <Group horizontal className={styles.user_button} onClick={onLogin}>
              <div>ВДОХ</div>
            </Group>
          )}
        </div>
      </div>,
      document.body
    );
  }
);

const Header = connect(mapStateToProps, mapDispatchToProps)(HeaderUnconnected);

export { Header };
