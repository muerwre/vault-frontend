import React, { FC, HTMLAttributes } from 'react';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { IComment } from '~/redux/types';
import * as styles from './styles.scss';
import { formatCommentText, getURL } from '~/utils/dom';
import { Group } from '~/components/containers/Group';
import { ImageUpload } from '~/components/upload/ImageUpload';

type IProps = HTMLAttributes<HTMLDivElement> & {
  is_empty?: boolean;
  is_loading?: boolean;
  photo?: string;
  comment?: IComment;
};

const Comment: FC<IProps> = ({ comment, is_empty, is_loading, className, photo, ...props }) => (
  <CommentWrapper is_empty={is_empty} is_loading={is_loading} photo={photo} {...props}>
    {comment.text && (
      <Group
        className={styles.text}
        dangerouslySetInnerHTML={{
          __html: formatCommentText(comment.user && comment.user.username, comment.text),
        }}
      />
    )}

    {comment.files && comment.files.length > 0 && (
      <div className={styles.images}>
        {comment.files.map(file => (
          <div>
            <img src={getURL(file.url)} />
          </div>
        ))}
      </div>
    )}
  </CommentWrapper>
);

export { Comment };
