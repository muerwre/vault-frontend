import React, { memo, VFC } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import classNames from 'classnames';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { getPrettyDate } from '~/utils/dom';
import { URLS } from '~/constants/urls';
import { Link } from 'react-router-dom';

interface IProps {
  id?: number;
  title: string;
  username?: string;
  createdAt: string;
  likeCount: number;

  isHeroic: boolean;
  isLocked: boolean;
  isLiked: boolean;

  canEdit: boolean;
  canLike: boolean;
  canStar: boolean;

  isLoading: boolean;

  onLike: () => void;
  onStar: () => void;
  onLock: () => void;
}

const NodeTitle: VFC<IProps> = memo(
  ({
    id,
    title,
    username,
    createdAt,
    likeCount,

    isHeroic,
    isLocked,
    isLiked,

    canStar,
    canEdit,
    canLike,

    isLoading,

    onStar,
    onLike,
    onLock,
  }) => {
    return (
      <div className={classNames(styles.wrap)}>
        <div className={styles.content}>
          <div className={styles.panel}>
            <div className={styles.title}>
              {isLoading ? <Placeholder width="40%" /> : title || '...'}
            </div>

            {!!username && (
              <div className={styles.name}>
                {isLoading ? (
                  <Placeholder width="100px" />
                ) : (
                  `~${username.toLocaleLowerCase()}, ${getPrettyDate(createdAt)}`
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
                  <div className={classNames(styles.star, { [styles.is_heroic]: isHeroic })}>
                    {isHeroic ? (
                      <Icon icon="star_full" size={24} onClick={onStar} />
                    ) : (
                      <Icon icon="star" size={24} onClick={onStar} />
                    )}
                  </div>
                )}

                <div>
                  <Icon icon={isLocked ? 'locked' : 'unlocked'} size={24} onClick={onLock} />
                </div>

                {!!id && (
                  <Link to={URLS.NODE_EDIT_URL(id)}>
                    <Icon icon="edit" size={24} />
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className={styles.buttons}>
            {canLike && (
              <div className={classNames(styles.like, { [styles.is_liked]: isLiked })}>
                {isLiked ? (
                  <Icon icon="heart_full" size={24} onClick={onLike} />
                ) : (
                  <Icon icon="heart" size={24} onClick={onLike} />
                )}

                {!!likeCount && likeCount > 0 && (
                  <div className={styles.like_count}>{likeCount}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export { NodeTitle };
