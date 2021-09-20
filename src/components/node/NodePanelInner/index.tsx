import React, { FC, memo } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { INode } from '~/redux/types';
import classNames from 'classnames';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { getPrettyDate } from '~/utils/dom';
import { URLS } from '~/constants/urls';
import { Link } from 'react-router-dom';

interface IProps {
  node?: Partial<INode>;
  stack?: boolean;

  canEdit: boolean;
  canLike: boolean;
  canStar: boolean;

  isLoading: boolean;

  onEdit: () => void;
  onLike: () => void;
  onStar: () => void;
  onLock: () => void;
}

const NodePanelInner: FC<IProps> = memo(
  ({
    stack,
    node,

    canStar,
    canEdit,
    canLike,

    isLoading,

    onStar,
    onEdit,
    onLike,
    onLock,
  }) => {
    return (
      <div className={classNames(styles.wrap, { stack })}>
        <div className={styles.content}>
          <div className={styles.panel}>
            <div className={styles.title}>
              {isLoading ? <Placeholder width="40%" /> : node?.title || '...'}
            </div>

            {node?.user && node?.user.username && (
              <div className={styles.name}>
                {isLoading ? (
                  <Placeholder width="100px" />
                ) : (
                  `~${node?.user.username.toLocaleLowerCase()}, ${getPrettyDate(node?.created_at)}`
                )}
              </div>
            )}
          </div>

          {canEdit && (
            <div className={styles.editor_menu}>
              <div className={styles.editor_menu_button}>
                <Icon icon="dots-vertical" size={24} />
              </div>

              <div className={styles.editor_buttons}>
                {canStar && (
                  <div className={classNames(styles.star, { is_heroic: node?.is_heroic })}>
                    {node?.is_heroic ? (
                      <Icon icon="star_full" size={24} onClick={onStar} />
                    ) : (
                      <Icon icon="star" size={24} onClick={onStar} />
                    )}
                  </div>
                )}

                <div>
                  <Icon
                    icon={node?.deleted_at ? 'locked' : 'unlocked'}
                    size={24}
                    onClick={onLock}
                  />
                </div>

                <Link to={URLS.NODE_EDIT_URL(node?.id)}>
                  <Icon icon="edit" size={24} onClick={onEdit} />
                </Link>
              </div>
            </div>
          )}

          <div className={styles.buttons}>
            {canLike && (
              <div className={classNames(styles.like, { is_liked: node?.is_liked })}>
                {node?.is_liked ? (
                  <Icon icon="heart_full" size={24} onClick={onLike} />
                ) : (
                  <Icon icon="heart" size={24} onClick={onLike} />
                )}

                {!!node?.like_count && node.like_count > 0 && (
                  <div className={styles.like_count}>{node.like_count}</div>
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
