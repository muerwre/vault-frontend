import React, { FC } from 'react';
import range from 'ramda/es/range';
import { Comment } from '../Comment';
import { INode } from '~/redux/types';
import { CommentForm } from '../CommentForm';
import { Group } from '~/components/containers/Group';

interface IProps {
  comments?: any;
}

const NodeComments: FC<IProps> = ({ comments }) => (
  <Group>
    {range(1, 6).map(el => (
      <Comment key={el} />
    ))}
  </Group>
);

export { NodeComments };
