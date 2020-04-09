import React, { FC, useMemo, memo } from 'react';
import { Comment } from '../Comment';
import { Filler } from '~/components/containers/Filler';

import * as styles from './styles.scss';
import { ICommentGroup, IComment } from '~/redux/types';
import { groupCommentsByUser } from '~/utils/fn';
import { IUser } from '~/redux/auth/types';
import { canEditComment } from '~/utils/node';
import { nodeLockComment, nodeEditComment } from '~/redux/node/actions';
import { INodeState } from '~/redux/node/reducer';
import { COMMENTS_DISPLAY } from '~/redux/node/constants';
import { plural } from '~/utils/dom';

interface IProps {
  comments?: IComment[];
  comment_data: INodeState['comment_data'];
  comment_count: INodeState['comment_count'];
  user: IUser;
  onDelete: typeof nodeLockComment;
  onEdit: typeof nodeEditComment;
  order?: 'ASC' | 'DESC';
}

const NodeComments: FC<IProps> = memo(
  ({ comments, comment_data, user, onDelete, onEdit, comment_count = 0, order = 'DESC' }) => {
    const comments_left = useMemo(() => Math.max(0, comment_count - comments.length), [
      comments,
      comment_count,
    ]);

    const groupped: ICommentGroup[] = useMemo(
      () => (order === 'DESC' ? [...comments].reverse() : comments).reduce(groupCommentsByUser, []),
      [comments, order]
    );

    return (
      <div className={styles.wrap}>
        {comment_count > 0 && (
          <div className={styles.more}>
            Показать ещё{' '}
            {plural(
              Math.min(comments_left, COMMENTS_DISPLAY),
              'комментарий',
              'комментария',
              'комментариев'
            )}
            {comments_left > COMMENTS_DISPLAY ? ` из ${comments_left} оставшихся` : ''}
          </div>
        )}

        {groupped.map(group => (
          <Comment
            key={group.ids.join()}
            comment_group={group}
            comment_data={comment_data}
            can_edit={canEditComment(group, user)}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    );
  }
);

export { NodeComments };
