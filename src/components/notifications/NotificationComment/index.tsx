import { FC } from 'react';

import { Anchor } from '~/components/common/Anchor';
import { InlineUsername } from '~/components/common/InlineUsername';
import { Square } from '~/components/common/Square';
import { NotificationItem } from '~/types/notifications';
import { formatText, getPrettyDate, getURLFromString } from '~/utils/dom';

import styles from './styles.module.scss';

interface NotificationCommentProps {
  item: NotificationItem;
}

const NotificationComment: FC<NotificationCommentProps> = ({ item }) => (
  <Anchor href={item.url} className={styles.link}>
    <div className={styles.message}>
      <div className={styles.icon}>
        <Square
          image={getURLFromString(item.user.photo, 'avatar')}
          className={styles.circle}
        />
      </div>

      <div className={styles.content}>
        <b className={styles.title}>
          <span>
            <InlineUsername>{item.user.username}</InlineUsername>:
          </span>
        </b>
        <div className={styles.text}>
          <div
            dangerouslySetInnerHTML={{
              __html: formatText(item.text),
            }}
          />
        </div>
      </div>
    </div>
  </Anchor>
);

export { NotificationComment };
