import React, { createElement, FC } from 'react';

import { Icon } from '~/components/input/Icon';
import { useRandomPhrase } from '~/constants/phrases';
import { INotification, NOTIFICATION_TYPES } from '~/types';

import { NotificationMessage } from '../NotificationMessage';

import styles from './styles.module.scss';

interface IProps {
  notifications: INotification[];
  onClick: (notification: INotification) => void;
}

const NOTIFICATION_RENDERERS = {
  [NOTIFICATION_TYPES.message]: NotificationMessage,
};

const NotificationBubble: FC<IProps> = ({ notifications, onClick }) => {
  const placeholder = useRandomPhrase('NOTHING_HERE');

  return (
    <div className={styles.wrap}>
      <div className={styles.list}>
        {notifications.length === 0 && (
          <div className={styles.placeholder}>
            <Icon icon="bell_ring" />
            <div>{placeholder}</div>
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
