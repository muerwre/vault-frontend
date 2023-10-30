import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import isBefore from 'date-fns/isBefore';
import { observer } from 'mobx-react-lite';

import { Anchor } from '~/components/common/Anchor';
import { Authorized } from '~/components/containers/Authorized';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import { Logo } from '~/components/main/Logo';
import { Dialog } from '~/constants/modal';
import { URLS } from '~/constants/urls';
import { useAuth } from '~/hooks/auth/useAuth';
import { useScrollTop } from '~/hooks/dom/useScrollTop';
import { useFlow } from '~/hooks/flow/useFlow';
import { useModal } from '~/hooks/modal/useModal';
import { useUpdates } from '~/hooks/updates/useUpdates';
import { useNotifications } from '~/utils/providers/NotificationProvider';

import { UserButtonWithNotifications } from '../UserButtonWithNotifications';

import styles from './styles.module.scss';

export interface HeaderProps {}

const Header: FC<HeaderProps> = observer(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { showModal } = useModal();
  const { isUser, user, fetched } = useAuth();
  const { hasFlowUpdates, hasLabUpdates } = useFlow();
  const { borisCommentedAt } = useUpdates();
  const { indicatorEnabled } = useNotifications();

  const onLogin = useCallback(() => showModal(Dialog.Login, {}), [showModal]);

  const top = useScrollTop();

  const hasBorisUpdates = useMemo(
    () =>
      isUser &&
      !indicatorEnabled &&
      borisCommentedAt &&
      ((fetched && !user.last_seen_boris) ||
        isBefore(new Date(user.last_seen_boris), new Date(borisCommentedAt))),
    [isUser, indicatorEnabled, borisCommentedAt, fetched, user.last_seen_boris],
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
            [styles.active]: true,
          })}
        >
          <Authorized hydratedOnly>
            <Anchor
              className={classNames(styles.item, {
                [styles.has_dot]: hasFlowUpdates && !indicatorEnabled,
              })}
              href={URLS.BASE}
            >
              ФЛОУ
            </Anchor>

            <Anchor
              className={classNames(styles.item, styles.lab, {
                [styles.has_dot]: hasLabUpdates && !indicatorEnabled,
              })}
              href={URLS.LAB}
            >
              ЛАБ
            </Anchor>

            <Anchor
              className={classNames(styles.item, styles.boris, {
                [styles.has_dot]: hasBorisUpdates && !indicatorEnabled,
              })}
              href={URLS.BORIS}
            >
              БОРИС
            </Anchor>
          </Authorized>
        </nav>

        {isUser && <UserButtonWithNotifications />}

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
