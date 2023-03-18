import { FC } from 'react';

import classNames from 'classnames';

import { Anchor } from '~/components/common/Anchor';
import { Avatar } from '~/components/common/Avatar';
import { InlineUsername } from '~/components/common/InlineUsername';
import { Square } from '~/components/common/Square';
import { NotificationItem } from '~/types/notifications';
import { formatText, getURLFromString } from '~/utils/dom';

import styles from './styles.module.scss';

interface NotificationCommentProps {
  item: NotificationItem;
  isNew?: boolean;
}

const NotificationComment: FC<NotificationCommentProps> = ({ item, isNew }) => (
  <Anchor href={item.url} className={styles.link}>
    <div className={classNames(styles.message, { [styles.new]: isNew })}>
      <div className={styles.icon}>
        <Avatar
          size={32}
          url={item.user?.photo}
          username={item.user?.username}
          className={styles.circle}
        />
      </div>

      <div className={styles.content}>
        <b className={styles.title}>
          <span>
            <InlineUsername>{item.user.username}</InlineUsername>
          </span>
          <span>-</span>
          {!!item.thumbnail && (
            <Square
              className={styles.item_image}
              size={16}
              image={getURLFromString(item.thumbnail, 'avatar')}
            />
          )}
          <div className={styles.item_title}>{item.title}</div>
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
