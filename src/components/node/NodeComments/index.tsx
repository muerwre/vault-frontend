import React, { FC, memo, useMemo } from 'react';
import { Comment } from '../../comment/Comment';

import styles from './styles.module.scss';
import { IComment, ICommentGroup, IFile } from '~/redux/types';
import { IUser } from '~/redux/auth/types';
import { canEditComment } from '~/utils/node';
import { INodeState } from '~/redux/node/reducer';
import { COMMENTS_DISPLAY } from '~/redux/node/constants';
import { plural } from '~/utils/dom';
import { useGrouppedComments } from '~/utils/hooks/node/useGrouppedComments';

interface IProps {
  comments: IComment[];
  count: INodeState['comment_count'];
  user: IUser;
  order?: 'ASC' | 'DESC';
  lastSeenCurrent?: string;
  onShowImageModal: (images: IFile[], index: number) => void;
  onLoadMoreComments: () => void;
  onDeleteComment: (id: IComment['id'], isLocked: boolean) => void;
}

const NodeComments: FC<IProps> = memo(
  ({
    comments,
    user,
    count = 0,
    order = 'DESC',
    onLoadMoreComments,
    onDeleteComment,
    onShowImageModal,
    lastSeenCurrent,
  }) => {
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
  }
);

export { NodeComments };
