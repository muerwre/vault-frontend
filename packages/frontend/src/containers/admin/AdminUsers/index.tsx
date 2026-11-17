import { FC } from 'react';

import classNames from 'classnames';
import Link from 'next/link';
import useSWR from 'swr';

import { apiGetAdminUsers } from '~/api/admin';
import { Avatar } from '~/components/common/Avatar';
import { LoaderCircle } from '~/components/common/LoaderCircle';
import { API } from '~/constants/api';
import { Role } from '~/constants/auth';
import { URLS } from '~/constants/urls';
import { IUser } from '~/types/auth';
import { getPrettyDate } from '~/utils/dom';

import styles from './styles.module.scss';

/** The backend's zero time, sent for users who were never seen. */
const neverSeen = (date?: string) =>
  !date || new Date(date).getFullYear() < 2000;

const lastVisit = (user: IUser) =>
  neverSeen(user.last_seen) ? 'не заходил' : getPrettyDate(user.last_seen);

/** Every user, most recently seen first, as the backend orders them. */
const AdminUsers: FC = () => {
  const { data } = useSWR(API.ADMIN.USERS, apiGetAdminUsers);

  if (!data) {
    return (
      <div className={styles.loading}>
        <LoaderCircle size={32} />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h2 className={styles.title}>Пользователи</h2>
        <span className={styles.count}>{data.users.length}</span>
      </header>

      <ul className={styles.grid}>
        {data.users.map((user) => (
          <li key={user.id}>
            <Link href={URLS.PROFILE_PAGE(user.username)} passHref>
              <a
                className={classNames(styles.card, {
                  [styles.never]: neverSeen(user.last_seen),
                })}
              >
                <Avatar
                  url={user.photo?.url}
                  username={user.username}
                  size={48}
                />

                <div className={styles.info}>
                  <div className={styles.name}>
                    {user.fullname || user.username}
                    {user.role === Role.Admin && (
                      <span className={styles.badge}>админ</span>
                    )}
                  </div>
                  <div className={styles.muted}>~{user.username}</div>
                  <div className={styles.muted}>{lastVisit(user)}</div>
                </div>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { AdminUsers };
