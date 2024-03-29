import { memo, VFC } from 'react';

import classNames from 'classnames';

import { SeparatedMenu } from '~/components/menu/SeparatedMenu';
import { NodeEditMenu } from '~/components/node/NodeEditMenu';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { getPrettyDate } from '~/utils/dom';

import { NodeLikeButton } from '../NodeLikeButton';

import styles from './styles.module.scss';

interface Props {
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
  onEdit: () => void;
}

const NodeTitle: VFC<Props> = memo(
  ({
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
    onEdit,
  }) => {
    return (
      <div className={classNames(styles.wrap)}>
        <div className={styles.content}>
          <div className={styles.panel}>
            <div className={styles.title}>
              {isLoading ? <Placeholder width="40%" /> : title || '...'}
            </div>

            {!!username && (
              <aside className={styles.name}>
                {isLoading ? (
                  <Placeholder width="100px" />
                ) : (
                  `~${username.toLocaleLowerCase()}, ${getPrettyDate(
                    createdAt,
                  )}`
                )}
              </aside>
            )}
          </div>

          <SeparatedMenu className={styles.buttons}>
            {canEdit && (
              <NodeEditMenu
                className={styles.button}
                canStar={canStar}
                isHeroic={isHeroic}
                isLocked={isLocked}
                onStar={onStar}
                onLock={onLock}
                onEdit={onEdit}
              />
            )}

            {canLike && (
              <NodeLikeButton
                active={isLiked}
                count={likeCount}
                onClick={onLike}
                className={styles.button}
              />
            )}
          </SeparatedMenu>
        </div>
      </div>
    );
  },
);

export { NodeTitle };
