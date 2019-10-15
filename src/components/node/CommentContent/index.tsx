import React, { FC, useMemo } from 'react';
import { IComment, IFile } from '~/redux/types';
import path from 'ramda/es/path';
import { formatCommentText, getURL } from '~/utils/dom';
import { Group } from '~/components/containers/Group';
import * as styles from './styles.scss';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import assocPath from 'ramda/es/assocPath';
import append from 'ramda/es/append';
import reduce from 'ramda/es/reduce';
import { AudioPlayer } from '~/components/media/AudioPlayer';
import classnames from 'classnames';

interface IProps {
  comment: IComment;
}

const CommentContent: FC<IProps> = ({ comment }) => {
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
    <>
      {comment.text && (
        <div className={styles.block}>
          <Group
            className={styles.text}
            dangerouslySetInnerHTML={{
              __html: formatCommentText(path(['user', 'username'], comment), comment.text),
            }}
          />
        </div>
      )}

      {groupped.image && groupped.image.length > 0 && (
        <div className={styles.block}>
          <div className={styles.images}>
            {groupped.image.map(file => (
              <div key={file.id}>
                <img src={getURL(file)} alt={file.name} />
              </div>
            ))}
          </div>
        </div>
      )}

      {groupped.audio && groupped.audio.length > 0 && (
        <>
          {groupped.audio.map(file => (
            <div className={classnames(styles.block, styles.audio_block)} key={file.id}>
              <AudioPlayer file={file} />
            </div>
          ))}
        </>
      )}
    </>
  );
};

export { CommentContent };

/*
{comment.text && (
        
      )}

      <div className={styles.date}>{getPrettyDate(comment.created_at)}</div>




      */
