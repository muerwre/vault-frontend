import React, { FC, HTMLAttributes } from 'react';
import { CommentWrapper } from '~/components/containers/CommentWrapper';

type IProps = HTMLAttributes<HTMLDivElement> & {
  is_empty?: boolean;
  is_loading?: boolean;
  photo?: string;
  comment?: any;
};

const Comment: FC<IProps> = ({ comment, is_empty, is_loading, className, photo, ...props }) => (
  <CommentWrapper is_empty={is_empty} is_loading={is_loading} photo={photo} {...props}>
    <div>Something!</div>
  </CommentWrapper>
);

export { Comment };
