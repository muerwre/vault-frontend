import React, { FC } from 'react';
import { Comment } from '../Comment';
import { Filler } from '~/components/containers/Filler';

import * as styles from './styles.scss';

interface IProps {
  comments?: any;
}

const isSameComment = (comments, index) =>
  comments[index - 1] && comments[index - 1].user.id === comments[index].user.id;

const NodeComments: FC<IProps> = ({ comments }) => (
  <div className={styles.wrap}>
    {comments.map((comment, index) => (
      <Comment key={comment.id} comment={comment} is_same={isSameComment(comments, index)} />
    ))}

    <Filler />
  </div>
);

export { NodeComments };
