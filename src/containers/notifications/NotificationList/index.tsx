import React, { FC } from 'react';

import { LoaderCircle } from '~/components/input/LoaderCircle';
import { NotificationBadge } from '~/components/notifications/NotificationBadge';
import { useNotificationsList } from '~/hooks/notifications/useNotificationsList';

import styles from './styles.module.scss';

interface NotificationListProps {}

const NotificationList: FC<NotificationListProps> = () => {
  const { isLoading, items } = useNotificationsList();

  if (isLoading) {
    return <LoaderCircle />;
  }

  return (
    <div className={styles.grid}>
      {/* <div className={styles.head}>HEAD</div> */}
      <div className={styles.list}>
        <div className={styles.items}>
          {items?.map((item) => (
            <div className={styles.item} key={item.created_at}>
              <NotificationBadge item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { NotificationList };
