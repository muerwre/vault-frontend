import React, { FC, HTMLAttributes, useMemo } from 'react';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import { IComment, IFile } from '~/redux/types';
import * as styles from './styles.scss';
import { formatCommentText, getURL, getPrettyDate } from '~/utils/dom';
import { Group } from '~/components/containers/Group';
import assocPath from 'ramda/es/assocPath';
import append from 'ramda/es/append';
import reduce from 'ramda/es/reduce';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { Player } from '~/utils/player';
import classNames from 'classnames';

type IProps = HTMLAttributes<HTMLDivElement> & {
  is_empty?: boolean;
  is_loading?: boolean;
  comment?: IComment;
  is_same?: boolean;
};

const Comment: FC<IProps> = ({ comment, is_empty, is_same, is_loading, className, ...props }) => {
  const groupped = useMemo<Record<keyof typeof UPLOAD_TYPES, IFile[]>>(
    () =>
      reduce(
        (group, file) => assocPath([file.type], append(file, group[file.type]), group),
        {},
        comment.files
      ),
    [comment]
  );

  return (
    <CommentWrapper
      className={className}
      is_empty={is_empty}
      is_loading={is_loading}
      photo={getURL(comment.user.photo)}
      is_same={is_same}
      {...props}
    >
      {comment.text && (
        <Group
          className={styles.text}
          dangerouslySetInnerHTML={{
            __html: formatCommentText(
              !is_same && comment.user && comment.user.username,
              comment.text
            ),
          }}
        />
      )}

      <div className={styles.date}>{getPrettyDate(comment.created_at)}</div>

      {groupped.image && (
        <div className={styles.images}>
          {groupped.image.map(file => (
            <div key={file.id}>
              <img src={getURL(file)} alt={file.name} />
            </div>
          ))}
        </div>
      )}

      {groupped.audio && (
        <div className={styles.audios}>
          {groupped.audio.map(file => (
            <div
              key={file.id}
              onClick={() => {
                Player.set(getURL(file));
                Player.load();
                Player.play();
              }}
            >
              {file.name}
            </div>
          ))}
        </div>
      )}
    </CommentWrapper>
  );
};

export { Comment };
