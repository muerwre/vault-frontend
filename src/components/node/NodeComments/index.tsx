import React, { FC, useMemo, memo } from 'react';
import { Comment } from '../Comment';
import { Filler } from '~/components/containers/Filler';

import * as styles from './styles.scss';
import { ICommentGroup, IComment } from '~/redux/types';
import { groupCommentsByUser } from '~/utils/fn';

interface IProps {
  comments?: IComment[];
}

const NodeComments: FC<IProps> = memo(({ comments }) => {
  const groupped: ICommentGroup[] = useMemo(() => comments.reduce(groupCommentsByUser, []), [
    comments,
  ]);

  return (
    <div className={styles.wrap}>
      {groupped.map(group => (
        <Comment key={group.ids.join()} comment_group={group} />
      ))}

      <Filler />
    </div>
  );
});

export { NodeComments };
