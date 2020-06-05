import React, { FC, useMemo, memo, createElement, useCallback, useState } from 'react';
import { IComment, IFile } from '~/redux/types';
import path from 'ramda/es/path';
import { formatCommentText, getURL, getPrettyDate } from '~/utils/dom';
import { Group } from '~/components/containers/Group';
import * as styles from './styles.scss';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import assocPath from 'ramda/es/assocPath';
import append from 'ramda/es/append';
import reduce from 'ramda/es/reduce';
import { AudioPlayer } from '~/components/media/AudioPlayer';
import classnames from 'classnames';
import { PRESETS } from '~/constants/urls';
import { COMMENT_BLOCK_RENDERERS } from '~/constants/comment';
import { nodeLockComment, nodeEditComment } from '~/redux/node/actions';
import { CommentMenu } from '../CommentMenu';

interface IProps {
  comment: IComment;
  can_edit: boolean;
  onDelete: typeof nodeLockComment;
  onEdit: typeof nodeEditComment;
}

const CommentContent: FC<IProps> = memo(({ comment, can_edit, onDelete, onEdit }) => {
  const groupped = useMemo<Record<keyof typeof UPLOAD_TYPES, IFile[]>>(
    () =>
      reduce(
        (group, file) => assocPath([file.type], append(file, group[file.type]), group),
        {},
        comment.files
      ),
    [comment]
  );

  const onLockClick = useCallback(() => {
    onDelete(comment.id, !comment.deleted_at);
  }, [comment, onDelete]);

  const onEditClick = useCallback(() => {
    onEdit(comment.id);
  }, [comment, onEdit]);

  const menu = useMemo(
    () => can_edit && <CommentMenu onDelete={onLockClick} onEdit={onEditClick} />,
    [can_edit, comment, onEditClick, onLockClick]
  );

  return (
    <div className={styles.wrap}>
      {comment.text && (
        <Group className={classnames(styles.block, styles.block_text)}>
          {menu}

          <Group className={styles.renderers}>
            {formatCommentText(path(['user', 'username'], comment), comment.text).map(
              (block, key) =>
                COMMENT_BLOCK_RENDERERS[block.type] &&
                createElement(COMMENT_BLOCK_RENDERERS[block.type], { block, key })
            )}
          </Group>

          <div className={styles.date}>{getPrettyDate(comment.created_at)}</div>
        </Group>
      )}

      {groupped.image && groupped.image.length > 0 && (
        <div className={classnames(styles.block, styles.block_image)}>
          {menu}

          <div className={styles.images}>
            {groupped.image.map(file => (
              <div key={file.id}>
                <img src={getURL(file, PRESETS['300'])} alt={file.name} />
              </div>
            ))}
          </div>

          <div className={styles.date}>{getPrettyDate(comment.created_at)}</div>
        </div>
      )}

      {groupped.audio && groupped.audio.length > 0 && (
        <>
          {groupped.audio.map(file => (
            <div className={classnames(styles.block, styles.block_audio)} key={file.id}>
              {menu}

              <AudioPlayer file={file} />

              <div className={styles.date}>{getPrettyDate(comment.created_at)}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
});

export { CommentContent };
