import React, { createElement, FC, Fragment, memo, useCallback, useMemo, useState } from 'react';
import { IComment, IFile } from '~/redux/types';
import { append, assocPath, path } from 'ramda';
import { formatCommentText, getPrettyDate, getURL } from '~/utils/dom';
import { Group } from '~/components/containers/Group';
import styles from './styles.module.scss';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import reduce from 'ramda/es/reduce';
import { AudioPlayer } from '~/components/media/AudioPlayer';
import classnames from 'classnames';
import { PRESETS } from '~/constants/urls';
import { COMMENT_BLOCK_RENDERERS } from '~/constants/comment';
import { CommentMenu } from '../CommentMenu';
import * as MODAL_ACTIONS from '~/redux/modal/actions';
import { CommentForm } from '~/components/comment/CommentForm';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectNode } from '~/redux/node/selectors';
import classNames from 'classnames';

interface IProps {
  comment: IComment;
  can_edit: boolean;
  onDelete: (id: IComment['id'], isLocked: boolean) => void;
  modalShowPhotoswipe: typeof MODAL_ACTIONS.modalShowPhotoswipe;
}

const CommentContent: FC<IProps> = memo(({ comment, can_edit, onDelete, modalShowPhotoswipe }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { current } = useShallowSelect(selectNode);

  const startEditing = useCallback(() => setIsEditing(true), [setIsEditing]);
  const stopEditing = useCallback(() => setIsEditing(false), [setIsEditing]);

  const groupped = useMemo<Record<keyof typeof UPLOAD_TYPES, IFile[]>>(
    () =>
      reduce(
        (group, file) =>
          file.type ? assocPath([file.type], append(file, group[file.type]), group) : group,
        {},
        comment.files
      ),
    [comment]
  );

  const onLockClick = useCallback(() => {
    onDelete(comment.id, !comment.deleted_at);
  }, [comment, onDelete]);

  const menu = useMemo(
    () => can_edit && <CommentMenu onDelete={onLockClick} onEdit={startEditing} />,
    [can_edit, startEditing, onLockClick]
  );

  const blocks = useMemo(
    () =>
      !!comment.text.trim()
        ? formatCommentText(path(['user', 'username'], comment), comment.text)
        : [],
    [comment]
  );

  if (isEditing) {
    return <CommentForm nodeId={current.id} comment={comment} onCancelEdit={stopEditing} />;
  }

  return (
    <div className={styles.wrap}>
      {comment.text && (
        <Group className={classnames(styles.block, styles.block_text)}>
          {menu}

          <Group className={styles.renderers}>
            {blocks.map(
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

          <div
            className={classNames(styles.images, { [styles.multiple]: groupped.image.length > 1 })}
          >
            {groupped.image.map((file, index) => (
              <div key={file.id} onClick={() => modalShowPhotoswipe(groupped.image, index)}>
                <img src={getURL(file, PRESETS['600'])} alt={file.name} />
              </div>
            ))}
          </div>

          <div className={styles.date}>{getPrettyDate(comment.created_at)}</div>
        </div>
      )}

      {groupped.audio && groupped.audio.length > 0 && (
        <Fragment>
          {groupped.audio.map(file => (
            <div className={classnames(styles.block, styles.block_audio)} key={file.id}>
              {menu}

              <AudioPlayer file={file} />

              <div className={styles.date}>{getPrettyDate(comment.created_at)}</div>
            </div>
          ))}
        </Fragment>
      )}
    </div>
  );
});

export { CommentContent };
