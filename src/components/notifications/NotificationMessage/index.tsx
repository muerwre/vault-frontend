import React, { FC } from 'react';
import styles from '~/components/notifications/NotificationBubble/styles.scss';
import { Icon } from '~/components/input/Icon';
import { IMessageNotification } from '~/redux/types';

interface IProps {
  notification: IMessageNotification;
}

const NotificationMessage: FC<IProps> = ({
  notification: {
    content: { text, from },
  },
}) => {
  return (
    <div className={styles.item}>
      <div className={styles.item_head}>
        <Icon icon="message" />
        <div className={styles.item_title}>Сообщение от ~{from.username}:</div>
      </div>
      <div className={styles.item_text}>{text}</div>
    </div>
  );
};

export { NotificationMessage };
