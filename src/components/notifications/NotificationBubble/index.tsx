import React, { FC, createElement } from 'react';
import { INotification, NOTIFICATION_TYPES } from '~/redux/types';
import styles from './styles.scss';
import { NotificationMessage } from '../NotificationMessage';

interface IProps {
  notifications: INotification[];
}

const NOTIFICATION_RENDERERS = {
  [NOTIFICATION_TYPES.message]: NotificationMessage,
};

const NotificationBubble: FC<IProps> = ({ notifications }) => {
  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        {notifications
          .filter(notification => notification.type && NOTIFICATION_RENDERERS[notification.type])
          .map(notification =>
            createElement(NOTIFICATION_RENDERERS[notification.type], {
              notification,
              onClick: console.log,
              key: notification.content.id,
            })
          )}
      </div>
    </div>
  );
};

export { NotificationBubble };
