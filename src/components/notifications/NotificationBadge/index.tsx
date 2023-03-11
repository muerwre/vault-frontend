import React, { FC } from 'react';

import { Anchor } from '~/components/common/Anchor';
import { InlineUsername } from '~/components/common/InlineUsername';
import { Square } from '~/components/common/Square';
import { Card } from '~/components/containers/Card';
import { FlowRecentItem } from '~/components/flow/FlowRecentItem';
import { NotificationItem, NotificationType } from '~/types/notifications';
import { formatText, getPrettyDate, getURLFromString } from '~/utils/dom';

import styles from './styles.module.scss';

interface NotificationBadgeProps {
  item: NotificationItem;
}

const getTitle = (item: NotificationItem) => {
  if (!item.user.username) {
    return '';
  }

  switch (item.type) {
    case NotificationType.Comment:
      return (
        <span>
          <InlineUsername>{item.user.username}</InlineUsername> пишет:
        </span>
      );
    case NotificationType.Node:
      return (
        <span>
          Новый пост от <InlineUsername>{item.user.username}</InlineUsername>:
        </span>
      );
  }
};

const getContent = (item: NotificationItem) => {
  switch (item.type) {
    case NotificationType.Comment:
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: formatText(item.text),
          }}
        />
      );
    case NotificationType.Node:
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: formatText(item.text),
          }}
        />
      );
  }
};

const getIcon = (item: NotificationItem) => {
  return <Square image={getURLFromString(item.thumbnail, 'avatar')} />;
};

const NotificationBadge: FC<NotificationBadgeProps> = ({ item }) => (
  <Anchor href={item.url} className={styles.link}>
    <div className={styles.message}>
      <div className={styles.icon}>{getIcon(item)}</div>

      <div>
        <b className={styles.title}>{getTitle(item)}</b>
        <div className={styles.text}>{getContent(item)}</div>
        <div className={styles.time}>{getPrettyDate(item.created_at)}</div>
      </div>
    </div>
  </Anchor>
);

export { NotificationBadge };
