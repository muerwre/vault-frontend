import { FC, useCallback, useEffect } from 'react';

import classNames from 'classnames';

import { Button } from '~/components/input/Button';
import { InputRow } from '~/components/input/InputRow';
import { LoaderScreen } from '~/components/input/LoaderScreen';
import { NotificationComment } from '~/components/notifications/NotificationComment';
import { NotificationNode } from '~/components/notifications/NotificationNode';
import { useNotificationsList } from '~/hooks/notifications/useNotificationsList';
import { NotificationItem, NotificationType } from '~/types/notifications';
import { useNotifications } from '~/utils/providers/NotificationProvider';

import styles from './styles.module.scss';

interface NotificationListProps {}

const NotificationList: FC<NotificationListProps> = () => {
  const { isLoading, items } = useNotificationsList();
  const { enabled, toggleEnabled } = useNotifications();
  const { markAsRead } = useNotifications();

  useEffect(() => {
    return () => markAsRead();
  }, []);

  const renderItem = useCallback((item: NotificationItem) => {
    switch (item.type) {
      case NotificationType.Comment:
        return <NotificationComment item={item} />;
      case NotificationType.Node:
        return <NotificationNode item={item} />;
      default:
        return null;
    }
  }, []);

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
