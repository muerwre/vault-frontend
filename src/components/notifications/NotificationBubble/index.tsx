import React, { FC, createElement } from 'react';
import { INotification, NOTIFICATION_TYPES } from '~/redux/types';
import styles from './styles.scss';
import { NotificationMessage } from '../NotificationMessage';
import { Icon } from '~/components/input/Icon';

interface IProps {
  notifications: INotification[];
  onClick: (notification: INotification) => void;
}

const NOTIFICATION_RENDERERS = {
  [NOTIFICATION_TYPES.message]: NotificationMessage,
};

const NotificationBubble: FC<IProps> = ({ notifications, onClick }) => {
  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        {notifications.length === 0 && (
          <div className={styles.placeholder}>
            <Icon icon="bell_ring" />
            <div>НЕТ УВЕДОМЛЕНИЙ</div>
          </div>
        )}
        {notifications.length > 0 &&
          notifications
            .filter(notification => notification.type && NOTIFICATION_RENDERERS[notification.type])
            .map(notification =>
              createElement(NOTIFICATION_RENDERERS[notification.type], {
                notification,
                onClick,
                key: notification.content.id,
              })
            )}
      </div>
    </div>
  );
};

export { NotificationBubble };
