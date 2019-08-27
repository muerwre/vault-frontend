import React, { FC } from 'react';
import range from 'ramda/es/range';
import { Comment } from '../Comment';
import { INode } from '~/redux/types';
import { CommentForm } from '../CommentForm';
import { Group } from '~/components/containers/Group';
import * as styles from './styles.scss';
import { Filler } from '~/components/containers/Filler';

interface IProps {
  comments?: any;
}

const NodeComments: FC<IProps> = ({ comments }) => (
  <Group className={styles.wrap}>
    {comments.map(comment => (
      <Comment key={comment.id} comment={comment} />
    ))}

    <Filler />
  </Group>
);

export { NodeComments };
