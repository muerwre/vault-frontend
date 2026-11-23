import { memo, VFC } from 'react';

import Tippy from '@tippyjs/react';
import classNames from 'classnames';
import { PinIcon } from 'lucide-react';

import { SeparatedMenu } from '~/components/menu/SeparatedMenu';
import { NodeEditMenu } from '~/components/node/NodeEditMenu';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { ProfileLink } from '~/components/profile/ProfileLink';
import { getPrettyDate } from '~/utils/dom';
import { formatUsername } from '~/utils/user';

import { NodeLikeButton } from '../NodeLikeButton';

import styles from './styles.module.scss';

interface Props {
  id?: number;
  title: string;
  username?: string;
  createdAt: string;
  likeCount: number;

  isHeroic: boolean;
  /** Pinned to the top of the author's profile. */
  isPinned?: boolean;
  isLocked: boolean;
  isLiked: boolean;

  canEdit: boolean;
  canLike: boolean;
  canStar: boolean;
  /** Pin or unpin the node on its author's profile; editors only. */
  canPin?: boolean;

  isLoading: boolean;

  onLike: () => void;
  onStar: () => void;
  onPin?: () => void;
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
    isPinned,
    isLocked,
    isLiked,

    canStar,
    canPin,
    canEdit,
    canLike,

    isLoading,

    onStar,
    onPin,
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
                  <>
                    <ProfileLink username={username}>
                      {formatUsername(username)}
                    </ProfileLink>
                    {`, ${getPrettyDate(createdAt)}`}
                  </>
                )}
              </aside>
            )}
          </div>

          <SeparatedMenu className={styles.buttons}>
            {isPinned && !isLoading && !(canEdit && canPin) && (
              <Tippy
                content={
                  username
                    ? `Закреплено наверху профиля ${formatUsername(username)}`
                    : 'Закреплено наверху профиля автора'
                }
              >
                <span className={styles.pin}>
                  <PinIcon size={21} fill="currentColor" />
                </span>
              </Tippy>
            )}

            {canEdit && (
              <NodeEditMenu
                className={styles.button}
                canStar={canStar}
                canPin={canPin}
                isHeroic={isHeroic}
                isPinned={isPinned}
                onPin={onPin}
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
