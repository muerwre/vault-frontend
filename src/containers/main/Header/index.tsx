import React, { FC, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '~/components/main/Logo';

import { Filler } from '~/components/containers/Filler';
import { UserButton } from '~/components/main/UserButton';
import { URLS } from '~/constants/urls';
import classNames from 'classnames';

import styles from './styles.module.scss';
import isBefore from 'date-fns/isBefore';
import { Authorized } from '~/components/containers/Authorized';
import { Button } from '~/components/input/Button';
import { observer } from 'mobx-react';
import { Dialog } from '~/constants/modal';
import { useGetLabStats } from '~/hooks/lab/useGetLabStats';
import { useAuth } from '~/hooks/auth/useAuth';
import { useModal } from '~/hooks/modal/useModal';
import { useScrollTop } from '~/hooks/dom/useScrollTop';
import { useFlow } from '~/hooks/flow/useFlow';
import { useUpdates } from '~/hooks/updates/useUpdates';

type HeaderProps = {};

const Header: FC<HeaderProps> = observer(() => {
  const labStats = useGetLabStats();

  const { logout } = useAuth();
  const { showModal } = useModal();
  const { isUser, user } = useAuth();
  const { updates: flowUpdates } = useFlow();
  const { borisCommentedAt } = useUpdates();

  const openProfile = useCallback(() => {
    showModal(Dialog.Profile, { username: user.username });
  }, [user.username, showModal]);

  const onLogin = useCallback(() => showModal(Dialog.Login, {}), [showModal]);

  const top = useScrollTop();

  const hasBorisUpdates = useMemo(
    () =>
      isUser &&
      borisCommentedAt &&
      (!user.last_seen_boris ||
        isBefore(new Date(user.last_seen_boris), new Date(borisCommentedAt))),
    [borisCommentedAt, isUser, user.last_seen_boris]
  );

  const hasLabUpdates = useMemo(() => labStats.updates.length > 0, [labStats.updates]);
  const hasFlowUpdates = useMemo(() => flowUpdates.length > 0, [flowUpdates]);

  return (
    <div className={classNames(styles.wrap, { [styles.is_scrolled]: top > 10 })}>
      <div className={styles.container}>
        <div className={classNames(styles.logo_wrapper, { [styles.logged_in]: isUser })}>
          <Logo />
        </div>

        <Filler className={styles.filler} />

        <div className={styles.plugs}>
          <Authorized>
            <Link
              className={classNames(styles.item, {
                [styles.has_dot]: hasFlowUpdates,
              })}
              to={URLS.BASE}
            >
              ФЛОУ
            </Link>

            <Link
              className={classNames(styles.item, styles.lab, {
                [styles.has_dot]: hasLabUpdates,
              })}
              to={URLS.LAB}
            >
              ЛАБ
            </Link>

            <Link
              className={classNames(styles.item, styles.boris, {
                [styles.has_dot]: hasBorisUpdates,
              })}
              to={URLS.BORIS}
            >
              БОРИС
            </Link>
          </Authorized>
        </div>

        {isUser && <UserButton user={user} onLogout={logout} authOpenProfile={openProfile} />}

        {!isUser && (
          <Button className={styles.user_button} onClick={onLogin} round color="secondary">
            ВДОХ
          </Button>
        )}
      </div>
    </div>
  );
});

export { Header };
