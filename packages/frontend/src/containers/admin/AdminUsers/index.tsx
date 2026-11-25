import { FC, MouseEvent, useCallback } from 'react';

import classNames from 'classnames';
import { XIcon } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

import {
  ApiAdminUser,
  apiDeleteAdminUser,
  apiGetAdminUsers,
} from '~/api/admin';
import { Avatar } from '~/components/common/Avatar';
import { LoaderCircle } from '~/components/common/LoaderCircle';
import { MasonryGrid } from '~/components/common/MasonryGrid';
import { Button } from '~/components/input/Button';
import { API } from '~/constants/api';
import { Role } from '~/constants/auth';
import { URLS } from '~/constants/urls';
import { AdminRegistrations } from '~/containers/admin/AdminRegistrations';
import { useAuth } from '~/hooks/auth/useAuth';
import { useConfirmation } from '~/hooks/dom/useConfirmation';
import { IUser } from '~/types/auth';
import { getPrettyDate } from '~/utils/dom';
import { showErrorToast } from '~/utils/errors/showToast';
import { showToastSuccess } from '~/utils/toast';
import { isUserActive } from '~/utils/user';
import { formatUsername } from '~/utils/user';

import styles from './styles.module.scss';

/** The backend's zero time, sent for users who were never seen. */
const neverSeen = (date?: string) =>
  !date || new Date(date).getFullYear() < 2000;

/** Short provider names for the `provider:id` labels. */
const PROVIDERS: Record<string, string> = {
  vkontakte: 'vk',
  google: 'google',
  telegram: 'telegram',
};

/** `google:someone@gmail.com`, `vk:1829572`; `direct` without any. */
const origins = (user: ApiAdminUser) =>
  user.accounts.length > 0
    ? user.accounts.map(
        (account) =>
          `${PROVIDERS[account.provider] ?? account.provider}:${account.account_id}`,
      )
    : ['direct'];

const lastVisit = (user: IUser) =>
  neverSeen(user.last_seen) ? 'не заходил' : getPrettyDate(user.last_seen);

/**
 * Every user, most recently seen first, as the backend orders them. Pending
 * registrations and unused invites come first.
 */
const getUserKey = (user: ApiAdminUser) => user.id;

const AdminUsers: FC = () => {
  const { data, mutate } = useSWR(API.ADMIN.USERS, apiGetAdminUsers);
  const { user: me } = useAuth();
  const confirm = useConfirmation();

  const onDelete = useCallback(
    (event: MouseEvent, user: ApiAdminUser) => {
      // The button sits inside the card's profile link.
      event.preventDefault();
      event.stopPropagation();

      confirm(
        `Удалить ${formatUsername(user.username)}? Пользователь больше не сможет войти, его посты и комментарии останутся.`,
        async () => {
          try {
            await apiDeleteAdminUser(user.id);
            await mutate();
            showToastSuccess(`${formatUsername(user.username)} удалён`);
          } catch (error) {
            showErrorToast(error);
          }
        },
      );
    },
    [confirm, mutate],
  );

  if (!data) {
    return (
      <div className={styles.loading}>
        <LoaderCircle size={32} />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <AdminRegistrations />

      <header className={styles.header}>
        <h2 className={styles.title}>Пользователи</h2>
        <span className={styles.count}>{data.users.length}</span>
      </header>

      <MasonryGrid
        items={data.users}
        itemKey={getUserKey}
        render={(user) => (
          <div>
            <Link href={URLS.PROFILE_PAGE(user.username)} passHref>
              <a
                className={classNames(styles.card, {
                  [styles.never]: neverSeen(user.last_seen),
                })}
              >
                <div
                  className={classNames(styles.avatar, {
                    [styles.alive]: isUserActive(user.last_seen),
                  })}
                  title={
                    isUserActive(user.last_seen)
                      ? 'Активен'
                      : 'Юнит деактивирован'
                  }
                >
                  <Avatar
                    url={user.photo?.url}
                    username={user.username}
                    size={48}
                  />
                </div>

                <div className={styles.info}>
                  <div className={styles.name}>
                    {user.fullname || user.username}
                    {user.role === Role.Admin && (
                      <span className={styles.badge}>админ</span>
                    )}
                  </div>
                  <div className={styles.muted}>
                    {formatUsername(user.username)}
                  </div>
                  <div className={styles.muted}>{lastVisit(user)}</div>
                  {origins(user).map((origin) => (
                    <div key={origin} className={styles.origin}>
                      {origin}
                    </div>
                  ))}
                </div>

                {/* Admins and yourself cannot be deleted here. */}
                {user.role !== Role.Admin && user.id !== me.id && (
                  <Button
                    className={styles.delete}
                    size="small"
                    color="gray"
                    iconLeft={<XIcon size={20} />}
                    iconOnly
                    type="button"
                    label="Удалить пользователя"
                    onClick={(event) => onDelete(event, user)}
                  />
                )}
              </a>
            </Link>
          </div>
        )}
      />
    </div>
  );
};

export { AdminUsers };
