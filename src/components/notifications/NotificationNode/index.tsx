import { FC, useMemo } from 'react';

import { NodeThumbnail } from '~/components/node/NodeThumbnail';
import { NotificationItem } from '~/types/notifications';
import { getPrettyDate } from '~/utils/dom';

import styles from './styles.module.scss';

interface NotificationNodeProps {
  item: NotificationItem;
}

const NotificationNode: FC<NotificationNodeProps> = ({ item }) => {
  const thumbnail = useMemo(
    () => ({
      title: item.title,
      thumbnail: item.thumbnail,
      is_promoted: true,
    }),
    [item],
  );

  return (
    <div className={styles.card}>
      <div className={styles.image}>
        <NodeThumbnail item={thumbnail} />
      </div>

      <div className={styles.text}>
        <div className={styles.title}>{item.title || '...'}</div>
        <div className={styles.user}>
          ~{item.user.username}, {getPrettyDate(item.created_at)}
        </div>
      </div>
    </div>
  );
};

export { NotificationNode };
