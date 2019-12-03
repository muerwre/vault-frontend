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

interface IProps {
  comments?: IComment[];
  comment_data: INodeState['comment_data'];
  user: IUser;
  onDelete: typeof nodeLockComment;
  onEdit: typeof nodeEditComment;
}

const NodeComments: FC<IProps> = memo(({ comments, comment_data, user, onDelete, onEdit }) => {
  const groupped: ICommentGroup[] = useMemo(() => comments.reduce(groupCommentsByUser, []), [
    comments,
  ]);

  return (
    <div className={styles.wrap}>
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

      <Filler />
    </div>
  );
});

export { NodeComments };
