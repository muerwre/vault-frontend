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

interface IProps {
  comments: IComment[];
  count: INodeState['comment_count'];
  user: IUser;
  order?: 'ASC' | 'DESC';
  onDelete: (id: IComment['id'], locked: boolean) => void;
  onLoadMoreComments: () => void;
  onShowPhotoswipe: (images: IFile[], index: number) => void;
}

const NodeComments: FC<IProps> = memo(
  ({
    onLoadMoreComments,
    onDelete,
    onShowPhotoswipe,
    comments,
    user,
    count = 0,
    order = 'DESC',
  }) => {
    const left = useMemo(() => Math.max(0, count - comments.length), [comments, count]);

    const groupped: ICommentGroup[] = useMemo(
      () => (order === 'DESC' ? [...comments].reverse() : comments).reduce(groupCommentsByUser, []),
      [comments, order]
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
            comment_group={group}
            can_edit={canEditComment(group, user)}
            onDelete={onDelete}
            modalShowPhotoswipe={onShowPhotoswipe}
          />
        ))}

        {order === 'ASC' && more}
      </div>
    );
  }
);

export { NodeComments };
