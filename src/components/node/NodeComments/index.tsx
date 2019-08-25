import React, { FC } from 'react';
import range from 'ramda/es/range';
import { Comment } from '../Comment';
import { INode } from '~/redux/types';

interface IProps {
  comments?: any;
}

const NodeComments: FC<IProps> = ({ comments }) => (
  <div>
    {range(1, 6).map(el => (
      <Comment key={el} />
    ))}
  </div>
);

export { NodeComments };
