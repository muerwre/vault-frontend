import React, { FC, useMemo, memo } from 'react';
import { Comment } from '../Comment';
import { Filler } from '~/components/containers/Filler';

import * as styles from './styles.scss';
import { ICommentGroup, IComment } from '~/redux/types';
import { groupCommentsByUser } from '~/utils/fn';
import { IUser } from '~/redux/auth/types';
import { canEditComment } from '~/utils/node';

interface IProps {
  comments?: IComment[];
  user: IUser;
  onDelete: (id: IComment['id'], is_deteted: boolean) => void;
}

const NodeComments: FC<IProps> = memo(({ comments, user, onDelete }) => {
  const groupped: ICommentGroup[] = useMemo(() => comments.reduce(groupCommentsByUser, []), [
    comments,
  ]);

  return (
    <div className={styles.wrap}>
      {groupped.map(group => (
        <Comment
          key={group.ids.join()}
          comment_group={group}
          can_edit={canEditComment(group, user)}
          onDelete={onDelete}
        />
      ))}

      <Filler />
    </div>
  );
});

export { NodeComments };
