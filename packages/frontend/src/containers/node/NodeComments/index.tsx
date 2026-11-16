import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import { observer } from 'mobx-react-lite';

import { LoadMoreButton } from '~/components/input/LoadMoreButton';
import { ANNOUNCE_USER_ID, BORIS_NODE_ID } from '~/constants/boris/constants';
import {
  getCommentId,
  isCommentAnchor,
  NEW_COMMENT_ANCHOR_NAME,
} from '~/constants/dom/links';
import { Comment } from '~/containers/node/NodeComments/components/Comment';
import { useGrouppedComments } from '~/hooks/node/useGrouppedComments';
import { ICommentGroup } from '~/types';
import { useCommentContext } from '~/utils/context/CommentContextProvider';
import { useNodeContext } from '~/utils/context/NodeContextProvider';
import { useUserContext } from '~/utils/context/UserContextProvider';
import { canEditComment, canLikeComment } from '~/utils/node';
import { VideoPlayerProvider } from '~/utils/providers/VideoPlayerProvider';

import styles from './styles.module.scss';

interface Props {
  order: 'ASC' | 'DESC';
}

const isFirstGroupWithNewComment = (
  group: ICommentGroup,
  prevGroup: ICommentGroup | undefined,
) => group.hasNew && (!prevGroup || !prevGroup.hasNew);

const NodeComments: FC<Props> = observer(({ order }) => {
  const user = useUserContext();
  const { node } = useNodeContext();

  const {
    comments,
    hasMore,
    isLoading,
    isLoadingMore,
    lastSeenCurrent,
    onLike,
    onLoadMoreComments,
    onDeleteComment,
    onShowImageModal,
    onSaveComment,
  } = useCommentContext();

  const groupped = useGrouppedComments(
    comments,
    order,
    lastSeenCurrent ?? undefined,
  );

  /**
   * With DESC order older comments are inserted above the ones on screen,
   * pushing them down. Remember where the topmost comment sits in the
   * viewport before loading, and put it back there once the page arrives.
   */
  const scrollAnchor = useRef<{
    id: string;
    top: number;
    count: number;
  } | null>(null);

  const loadMore = useCallback(() => {
    const oldest = comments[comments.length - 1];
    const element =
      order === 'DESC' && oldest
        ? document.getElementById(getCommentId(oldest.id))
        : null;

    scrollAnchor.current = element
      ? {
          id: element.id,
          top: element.getBoundingClientRect().top,
          count: comments.length,
        }
      : null;

    onLoadMoreComments();
  }, [comments, order, onLoadMoreComments]);

  useLayoutEffect(() => {
    const anchor = scrollAnchor.current;

    if (!anchor) {
      return;
    }

    // Nothing new arrived: keep waiting while loading, give up once done.
    if (anchor.count === comments.length) {
      if (!isLoadingMore) {
        scrollAnchor.current = null;
      }

      return;
    }

    scrollAnchor.current = null;

    const element = document.getElementById(anchor.id);

    if (element) {
      window.scrollBy(0, element.getBoundingClientRect().top - anchor.top);
    }
  }, [comments.length, isLoadingMore]);

  const more = useMemo(
    () =>
      hasMore &&
      !isLoading && (
        <div className={styles.more}>
          <LoadMoreButton isLoading={isLoadingMore} onClick={loadMore} />
        </div>
      ),
    [hasMore, loadMore, isLoadingMore, isLoading],
  );

  if (!node?.id) {
    return null;
  }

  /** Scrolls down to new comments or specific one from anchor */
  useEffect(() => {
    const anchor = location.hash?.replace('#', '');

    if (!isLoading && isCommentAnchor(anchor)) {
      setTimeout(
        () =>
          document
            .getElementById(anchor)
            ?.scrollIntoView({ behavior: 'smooth' }),
        300,
      );
    }
  }, [isLoading]);

  return (
    <VideoPlayerProvider>
      <div className={styles.wrap}>
        {order === 'DESC' && more}

        {groupped.map((group, index) => (
          <>
            {isFirstGroupWithNewComment(group, groupped[index - 1]) && (
              <a
                id={NEW_COMMENT_ANCHOR_NAME}
                className={styles.newCommentAnchor}
              />
            )}

            <Comment
              nodeId={node.id!}
              key={group.ids.join()}
              group={group}
              highlighted={
                node.id === BORIS_NODE_ID && group.user.id === ANNOUNCE_USER_ID
              }
              onLike={onLike}
              canLike={canLikeComment(group, user)}
              canEdit={canEditComment(group, user)}
              onDelete={onDeleteComment}
              onShowImageModal={onShowImageModal}
              isSame={group.user.id === user.id}
              saveComment={onSaveComment}
            />
          </>
        ))}

        {order === 'ASC' && more}
      </div>
    </VideoPlayerProvider>
  );
});

export { NodeComments };
