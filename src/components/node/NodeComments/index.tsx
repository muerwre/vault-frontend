import React, { FC, memo, useCallback, useMemo } from 'react';
import { Comment } from '../../comment/Comment';

import styles from './styles.module.scss';
import { IComment, ICommentGroup, IFile } from '~/redux/types';
import { groupCommentsByUser } from '~/utils/fn';
import { IUser } from '~/redux/auth/types';
import { canEditComment } from '~/utils/node';
import { nodeLoadMoreComments, nodeLockComment } from '~/redux/node/actions';
import { INodeState } from '~/redux/node/reducer';
import { COMMENTS_DISPLAY } from '~/redux/node/constants';
import { plural } from '~/utils/dom';
import { modalShowPhotoswipe } from '~/redux/modal/actions';
import { useDispatch } from 'react-redux';
import { useGrouppedComments } from '~/utils/hooks/node/useGrouppedComments';

interface IProps {
  comments: IComment[];
  count: INodeState['comment_count'];
  user: IUser;
  order?: 'ASC' | 'DESC';
  lastSeenCurrent?: string;
}

const NodeComments: FC<IProps> = memo(
  ({ comments, user, count = 0, order = 'DESC', lastSeenCurrent }) => {
    const dispatch = useDispatch();
    const left = useMemo(() => Math.max(0, count - comments.length), [comments, count]);

    const groupped: ICommentGroup[] = useGrouppedComments(comments, order, lastSeenCurrent);

    const onDelete = useCallback(
      (id: IComment['id'], locked: boolean) => dispatch(nodeLockComment(id, locked)),
      [dispatch]
    );
    const onLoadMoreComments = useCallback(() => dispatch(nodeLoadMoreComments()), [dispatch]);
    const onShowPhotoswipe = useCallback(
      (images: IFile[], index: number) => dispatch(modalShowPhotoswipe(images, index)),
      [dispatch]
    );

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
            onDelete={onDelete}
            modalShowPhotoswipe={onShowPhotoswipe}
            isSame={group.user.id === user.id}
          />
        ))}

        {order === 'ASC' && more}
      </div>
    );
  }
);

export { NodeComments };
