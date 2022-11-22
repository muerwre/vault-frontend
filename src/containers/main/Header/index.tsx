import { FC, useCallback, useEffect, useMemo, useState } from 'react';

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
import { SidebarName } from '~/constants/sidebar';
import { URLS } from '~/constants/urls';
import { useAuth } from '~/hooks/auth/useAuth';
import { useScrollTop } from '~/hooks/dom/useScrollTop';
import { useFlow } from '~/hooks/flow/useFlow';
import { useModal } from '~/hooks/modal/useModal';
import { useUpdates } from '~/hooks/updates/useUpdates';
import { useSidebar } from '~/utils/providers/SidebarProvider';

import styles from './styles.module.scss';

export interface HeaderProps {}

const Header: FC<HeaderProps> = observer(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { showModal } = useModal();
  const { isUser, user } = useAuth();
  const { hasFlowUpdates, hasLabUpdates } = useFlow();
  const { borisCommentedAt } = useUpdates();
  const { open } = useSidebar();

  const openProfileSidebar = useCallback(() => {
    open(SidebarName.Settings, {});
  }, [open]);

  const onLogin = useCallback(() => showModal(Dialog.Login, {}), [showModal]);

  const top = useScrollTop();

  const hasBorisUpdates = useMemo(
    () =>
      isUser &&
      borisCommentedAt &&
      (!user.last_seen_boris ||
        isBefore(new Date(user.last_seen_boris), new Date(borisCommentedAt))),
    [borisCommentedAt, isUser, user.last_seen_boris],
  );

  // Needed for SSR
  useEffect(() => {
    setIsScrolled(top > 10);
  }, [top]);

  return (
    <header
      className={classNames(styles.wrap, { [styles.is_scrolled]: isScrolled })}
    >
      <div className={styles.container}>
        <div className={styles.logo_wrapper}>
          <Logo />
        </div>

        <Filler className={styles.filler} />

        <nav
          className={classNames(styles.plugs, {
            // [styles.active]: isHydrated && fetched,
            [styles.active]: true,
          })}
        >
          <Authorized hydratedOnly>
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

        {isUser && (
          <UserButton
            username={user.username}
            photo={user.photo}
            onClick={openProfileSidebar}
          />
        )}

        {!isUser && (
          <Button className={styles.user_button} onClick={onLogin} round>
            ВДОХ
          </Button>
        )}
      </div>
    </header>
  );
});

export { Header };
