import { FC, useCallback, useEffect } from 'react';

import classNames from 'classnames';
import { isAfter, parseISO } from 'date-fns';

import { LoaderScreen } from '~/components/common/LoaderScreen';
import { Button } from '~/components/input/Button';
import { InputRow } from '~/components/input/InputRow';
import { NotificationComment } from '~/components/notifications/NotificationComment';
import { NotificationNode } from '~/components/notifications/NotificationNode';
import { useNotificationsList } from '~/hooks/notifications/useNotificationsList';
import { NotificationItem, NotificationType } from '~/types/notifications';
import { useNotifications } from '~/utils/providers/NotificationProvider';

import styles from './styles.module.scss';

interface NotificationListProps {}

const NotificationList: FC<NotificationListProps> = () => {
  const { isLoading, items } = useNotificationsList();
  const { enabled, toggleEnabled, lastSeen } = useNotifications();
  const { markAsRead } = useNotifications();

  useEffect(() => {
    return () => markAsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = useCallback(
    (item: NotificationItem) => {
      const isNew =
        !lastSeen ||
        !item.created_at ||
        isAfter(parseISO(item.created_at), lastSeen);
      switch (item.type) {
        case NotificationType.Comment:
        case NotificationType.Boris:
          return <NotificationComment item={item} isNew={isNew} />;
        case NotificationType.Node:
          return <NotificationNode item={item} isNew={isNew} />;
        default:
          return null;
      }
    },
    [lastSeen],
  );

  if (isLoading) {
    return <LoaderScreen align="top" />;
  }

  return (
    <div className={styles.grid}>
      {!enabled && (
        <div className={styles.head}>
          <InputRow
            input={
              <Button size="small" onClick={toggleEnabled}>
                Включить
              </Button>
            }
          >
            Уведомления выключены
          </InputRow>
        </div>
      )}

      <div className={classNames(styles.list, { [styles.inactive]: !enabled })}>
        <div className={styles.items}>
          {items?.map((item) => (
            <div className={styles.item} key={item.created_at}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { NotificationList };
