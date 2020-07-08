import React, { FC, useMemo, memo } from 'react';
import { Comment } from '../Comment';
import { Filler } from '~/components/containers/Filler';

import * as styles from './styles.scss';
import { ICommentGroup, IComment } from '~/redux/types';
import { groupCommentsByUser } from '~/utils/fn';
import { IUser } from '~/redux/auth/types';
import { canEditComment } from '~/utils/node';
import { nodeLockComment, nodeEditComment, nodeLoadMoreComments } from '~/redux/node/actions';
import { INodeState } from '~/redux/node/reducer';
import { COMMENTS_DISPLAY } from '~/redux/node/constants';
import { plural } from '~/utils/dom';
import * as MODAL_ACTIONS from '~/redux/modal/actions';

interface IProps {
  comments?: IComment[];
  comment_data: INodeState['comment_data'];
  comment_count: INodeState['comment_count'];
  user: IUser;
  onDelete: typeof nodeLockComment;
  onEdit: typeof nodeEditComment;
  onLoadMore: typeof nodeLoadMoreComments;
  order?: 'ASC' | 'DESC';
  modalShowPhotoswipe: typeof MODAL_ACTIONS.modalShowPhotoswipe;
}

const NodeComments: FC<IProps> = memo(
  ({
    comments,
    comment_data,
    user,
    onDelete,
    onEdit,
    onLoadMore,
    comment_count = 0,
    order = 'DESC',
    modalShowPhotoswipe,
  }) => {
    const comments_left = useMemo(() => Math.max(0, comment_count - comments.length), [
      comments,
      comment_count,
    ]);

    const groupped: ICommentGroup[] = useMemo(
      () => (order === 'DESC' ? [...comments].reverse() : comments).reduce(groupCommentsByUser, []),
      [comments, order]
    );

    const more = useMemo(
      () =>
        comments_left > 0 && (
          <div className={styles.more} onClick={onLoadMore}>
            Показать ещё{' '}
            {plural(
              Math.min(comments_left, COMMENTS_DISPLAY),
              'комментарий',
              'комментария',
              'комментариев'
            )}
            {comments_left > COMMENTS_DISPLAY ? ` из ${comments_left} оставшихся` : ''}
          </div>
        ),
      [comments_left, onLoadMore, COMMENTS_DISPLAY]
    );

    return (
      <div className={styles.wrap}>
        {order === 'DESC' && more}

        {groupped.map(group => (
          <Comment
            key={group.ids.join()}
            comment_group={group}
            comment_data={comment_data}
            can_edit={canEditComment(group, user)}
            onDelete={onDelete}
            onEdit={onEdit}
            modalShowPhotoswipe={modalShowPhotoswipe}
          />
        ))}

        {order === 'ASC' && more}
      </div>
    );
  }
);

export { NodeComments };
