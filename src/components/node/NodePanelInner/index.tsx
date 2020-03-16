import React, { FC, memo } from 'react';
import * as styles from './styles.scss';
import { Group } from '~/components/containers/Group';
import { Filler } from '~/components/containers/Filler';
import { Icon } from '~/components/input/Icon';
import { INode } from '~/redux/types';
import classNames from 'classnames';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { getPrettyDate } from '~/utils/dom';

interface IProps {
  node: Partial<INode>;
  stack?: boolean;

  can_edit: boolean;
  can_like: boolean;
  can_star: boolean;

  is_loading: boolean;

  onEdit: () => void;
  onLike: () => void;
  onStar: () => void;
  onLock: () => void;
}

const NodePanelInner: FC<IProps> = memo(
  ({
    node: { title, user, is_liked, is_heroic, deleted_at, created_at },
    stack,

    can_star,
    can_edit,
    can_like,

    is_loading,

    onStar,
    onEdit,
    onLike,
    onLock,
  }) => {
    return (
      <div className={classNames(styles.wrap, { stack })}>
        <div className={styles.content}>
          <Group horizontal className={styles.panel}>
            <Filler>
              <div className={styles.title}>
                {is_loading ? <Placeholder width="40%" /> : title || '...'}
              </div>
              {user && user.username && (
                <div className={styles.name}>
                  {is_loading ? (
                    <Placeholder width="100px" />
                  ) : (
                    `~${user.username}, ${getPrettyDate(created_at)}`
                  )}
                </div>
              )}
            </Filler>
          </Group>

          <div className={styles.buttons}>
            {can_star && (
              <div className={classNames(styles.star, { is_heroic })}>
                {is_heroic ? (
                  <Icon icon="star_full" size={24} onClick={onStar} />
                ) : (
                  <Icon icon="star" size={24} onClick={onStar} />
                )}
              </div>
            )}

            {can_edit && (
              <>
                <div>
                  <Icon icon={deleted_at ? 'locked' : 'unlocked'} size={24} onClick={onLock} />
                </div>

                <div>
                  <Icon icon="edit" size={24} onClick={onEdit} />
                </div>
              </>
            )}

            {can_like && (
              <div className={classNames(styles.like, { is_liked })}>
                {is_liked ? (
                  <Icon icon="heart_full" size={24} onClick={onLike} />
                ) : (
                  <Icon icon="heart" size={24} onClick={onLike} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export { NodePanelInner };
