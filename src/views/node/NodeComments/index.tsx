import React, { FC, memo, useMemo } from 'react';

import styles from './styles.module.scss';
import { ICommentGroup } from '~/redux/types';
import { canEditComment } from '~/utils/node';
import { COMMENTS_DISPLAY } from '~/redux/node/constants';
import { plural } from '~/utils/dom';
import { useGrouppedComments } from '~/utils/hooks/node/useGrouppedComments';
import { useCommentContext } from '~/utils/context/CommentContextProvider';
import { Comment } from '~/components/comment/Comment';
import { useUserContext } from '~/utils/context/UserContextProvider';

interface IProps {
  order: 'ASC' | 'DESC';
}

const NodeComments: FC<IProps> = memo(({ order }) => {
  const user = useUserContext();
  const {
    comments,
    count,
    lastSeenCurrent,
    onLoadMoreComments,
    onDeleteComment,
    onShowImageModal,
  } = useCommentContext();

  const left = useMemo(() => Math.max(0, count - comments.length), [comments, count]);

  const groupped: ICommentGroup[] = useGrouppedComments(comments, order, lastSeenCurrent);

  const more = useMemo(
    () =>
      left > 0 && (
        <div className={styles.more} onClick={onLoadMoreComments}>
          Показать ещё{' '}
          {plural(Math.min(left, COMMENTS_DISPLAY), 'комментарий', 'комментария', 'комментариев')}
          {left > COMMENTS_DISPLAY ? ` из ${left} оставшихся` : ''}
        </div>
      ),
    [left, onLoadMoreComments]
  );

  return (
    <div className={styles.wrap}>
      {order === 'DESC' && more}

      {groupped.map(group => (
        <Comment
          key={group.ids.join()}
          group={group}
          canEdit={canEditComment(group, user)}
          onDelete={onDeleteComment}
          onShowImageModal={onShowImageModal}
          isSame={group.user.id === user.id}
        />
      ))}

      {order === 'ASC' && more}
    </div>
  );
});

export { NodeComments };
