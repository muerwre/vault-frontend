import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import isBefore from 'date-fns/isBefore';
import { observer } from 'mobx-react-lite';

import { Anchor } from '~/components/common/Anchor';
import { Authorized } from '~/components/containers/Authorized';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import { Logo } from '~/components/main/Logo';
import { UserButton } from '~/components/main/UserButton';
import { Dialog } from '~/constants/modal';
import { isSSR } from '~/constants/ssr';
import { URLS } from '~/constants/urls';
import { useAuth } from '~/hooks/auth/useAuth';
import { useScrollTop } from '~/hooks/dom/useScrollTop';
import { useFlow } from '~/hooks/flow/useFlow';
import { useGetLabStats } from '~/hooks/lab/useGetLabStats';
import { useModal } from '~/hooks/modal/useModal';
import { useUpdates } from '~/hooks/updates/useUpdates';

import styles from './styles.module.scss';

type HeaderProps = {};

const Header: FC<HeaderProps> = observer(() => {
  const labStats = useGetLabStats();

  const [isScrolled, setIsScrolled] = useState(false);
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

  // Needed for SSR
  useEffect(() => {
    setIsScrolled(top > 10);
  }, [top]);

  return (
    <header className={classNames(styles.wrap, { [styles.is_scrolled]: isScrolled })}>
      <div className={styles.container}>
        <div className={styles.logo_wrapper}>
          <Logo />
        </div>

        <Filler className={styles.filler} />

        <nav className={styles.plugs}>
          <Authorized>
            <Anchor
              className={classNames(styles.item, {
                [styles.has_dot]: hasFlowUpdates,
              })}
              href={URLS.BASE}
            >
              ФЛОУ
            </Anchor>

            <Anchor
              className={classNames(styles.item, styles.lab, {
                [styles.has_dot]: hasLabUpdates,
              })}
              href={URLS.LAB}
            >
              ЛАБ
            </Anchor>

            <Anchor
              className={classNames(styles.item, styles.boris, {
                [styles.has_dot]: hasBorisUpdates,
              })}
              href={URLS.BORIS}
            >
              БОРИС
            </Anchor>
          </Authorized>
        </nav>

        {isUser && <UserButton user={user} onLogout={logout} authOpenProfile={openProfile} />}

        {!isUser && (
          <Button className={styles.user_button} onClick={onLogin} round color="secondary">
            ВДОХ
          </Button>
        )}
      </div>
    </header>
  );
});

export { Header };
