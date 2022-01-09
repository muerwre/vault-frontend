import React, { FC, useCallback } from 'react';
import styles from '~/components/notifications/NotificationBubble/styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { IMessageNotification, INotification } from '~/types';

interface IProps {
  notification: IMessageNotification;
  onClick: (notification: INotification) => void;
}

const NotificationMessage: FC<IProps> = ({
  notification,
  notification: {
    content: { text, from },
  },
  onClick,
}) => {
  const onMouseDown = useCallback(() => onClick(notification), [onClick, notification]);

  return (
    <div className={styles.item} onMouseDown={onMouseDown}>
      <div className={styles.item_head}>
        <Icon icon="message" />
        <div className={styles.item_title}>Сообщение от ~{from?.username}:</div>
      </div>
      <div className={styles.item_text}>{text}</div>
    </div>
  );
};

export { NotificationMessage };
