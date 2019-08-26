import React, { FC, HTMLAttributes } from 'react';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { IComment } from '~/redux/types';
import * as styles from './styles.scss';

type IProps = HTMLAttributes<HTMLDivElement> & {
  is_empty?: boolean;
  is_loading?: boolean;
  photo?: string;
  comment?: IComment;
};

const Comment: FC<IProps> = ({ comment, is_empty, is_loading, className, photo, ...props }) => (
  <CommentWrapper is_empty={is_empty} is_loading={is_loading} photo={photo} {...props}>
    {comment.text && <div className={styles.text}>{comment.text}</div>}
  </CommentWrapper>
);

export { Comment };
