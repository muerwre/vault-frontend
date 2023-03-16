import React, {
  createElement,
  FC,
  Fragment,
  memo,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';

import classnames from 'classnames';

import { CommentForm } from '~/components/comment/CommentForm';
import { Authorized } from '~/components/containers/Authorized';
import { Group } from '~/components/containers/Group';
import { AudioPlayer } from '~/components/media/AudioPlayer';
import { COMMENT_BLOCK_RENDERERS } from '~/constants/comment';
import { UploadType } from '~/constants/uploads';
import { imagePresets } from '~/constants/urls';
import { IComment, IFile } from '~/types';
import { formatCommentText, getPrettyDate, getURL } from '~/utils/dom';
import { append, assocPath, path, reduce } from '~/utils/ramda';

import { CommentImageGrid } from '../CommentImageGrid';
import { CommentMenu } from '../CommentMenu';

import styles from './styles.module.scss';

interface IProps {
  prefix?: ReactNode;
  nodeId: number;
  comment: IComment;
  canEdit: boolean;
  saveComment: (data: IComment) => Promise<unknown>;
  onDelete: (id: IComment['id'], isLocked: boolean) => void;
  onShowImageModal: (images: IFile[], index: number) => void;
}

const CommentContent: FC<IProps> = memo(
  ({
    comment,
    canEdit,
    nodeId,
    saveComment,
    onDelete,
    onShowImageModal,
    prefix,
  }) => {
    const [isEditing, setIsEditing] = useState(false);

    const startEditing = useCallback(() => setIsEditing(true), [setIsEditing]);
    const stopEditing = useCallback(() => setIsEditing(false), [setIsEditing]);

    const groupped = useMemo<Record<UploadType, IFile[]>>(
      () =>
        reduce(
          (group, file) =>
            file.type
              ? assocPath([file.type], append(file, group[file.type]), group)
              : group,
          {} as Record<UploadType, IFile[]>,
          comment.files,
        ),
      [comment],
    );

    const onLockClick = useCallback(() => {
      onDelete(comment.id, !comment.deleted_at);
    }, [comment, onDelete]);

    const onImageClick = useCallback(
      (file: IFile) =>
        onShowImageModal(groupped.image, groupped.image.indexOf(file)),
      [onShowImageModal, groupped],
    );

    const menu = useMemo(
      () => (
        <div>
          {canEdit && (
            <Authorized>
              <CommentMenu onDelete={onLockClick} onEdit={startEditing} />
            </Authorized>
          )}
        </div>
      ),
      [canEdit, startEditing, onLockClick],
    );

    const blocks = useMemo(
      () =>
        !!comment.text.trim()
          ? formatCommentText(path(['user', 'username'], comment), comment.text)
          : [],
      [comment],
    );

    if (isEditing) {
      return (
        <CommentForm
          saveComment={saveComment}
          nodeId={nodeId}
          comment={comment}
          onCancelEdit={stopEditing}
        />
      );
    }

    return (
      <div className={styles.wrap}>
        {!!prefix && <div className={styles.prefix}>{prefix}</div>}

        {comment.text.trim() && (
          <Group className={classnames(styles.block, styles.block_text)}>
            {menu}

            <Group className={styles.renderers}>
              {blocks.map(
                (block, key) =>
                  COMMENT_BLOCK_RENDERERS[block.type] &&
                  createElement(COMMENT_BLOCK_RENDERERS[block.type], {
                    block,
                    key,
                  }),
              )}
            </Group>

            <div className={styles.date}>
              {getPrettyDate(comment.created_at)}
            </div>
          </Group>
        )}

        {groupped.image && groupped.image.length > 0 && (
          <div className={classnames(styles.block, styles.block_image)}>
            {menu}

            <CommentImageGrid files={groupped.image} onClick={onImageClick} />

            <div className={styles.date}>
              {getPrettyDate(comment.created_at)}
            </div>
          </div>
        )}

        {groupped.audio && groupped.audio.length > 0 && (
          <Fragment>
            {groupped.audio.map((file) => (
              <div
                className={classnames(styles.block, styles.block_audio)}
                key={file.id}
              >
                {menu}

                <AudioPlayer file={file} />

                <div className={styles.date}>
                  {getPrettyDate(comment.created_at)}
                </div>
              </div>
            ))}
          </Fragment>
        )}
      </div>
    );
  },
);

export { CommentContent };
