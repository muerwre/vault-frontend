import {
  createElement,
  FC,
  memo,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';

import classnames from 'classnames';

import { AudioPlayer } from '~/components/common/AudioPlayer';
import { Group } from '~/components/common/Group';
import { UploadType } from '~/constants/uploads';
import { IComment, IFile } from '~/types';
import { formatCommentText, getPrettyDate } from '~/utils/dom';
import { append, assocPath, path, reduce } from '~/utils/ramda';

import { CommentEditingForm } from './components/CommentEditingForm';
import { CommentImageGrid } from './components/CommentImageGrid';
import { CommentLike } from './components/CommentLike';
import { CommentMenu } from './components/CommentMenu';
import { COMMENT_BLOCK_RENDERERS } from './constants';
import styles from './styles.module.scss';

interface Props {
  prefix?: ReactNode;
  nodeId: number;
  comment: IComment;
  canEdit: boolean;
  canLike: boolean;
  saveComment: (data: IComment) => Promise<IComment | undefined>;
  onDelete: (isLocked: boolean) => void;
  onLike: () => void;
  onShowImageModal: (images: IFile[], index: number) => void;
}

const CommentContent: FC<Props> = memo(
  ({
    comment,
    nodeId,
    saveComment,
    canEdit,
    canLike,
    onLike,
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
      onDelete(!comment.deleted_at);
    }, [comment, onDelete]);

    const onImageClick = useCallback(
      (file: IFile) =>
        onShowImageModal(groupped.image, groupped.image.indexOf(file)),
      [onShowImageModal, groupped],
    );

    const menu = useMemo(
      () =>
        canEdit && (
          <div className={styles.menu}>
            <CommentMenu onDelete={onLockClick} onEdit={startEditing} />
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
        <CommentEditingForm
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

        <div className={styles.content}>
          {menu}

          <div>
            {comment.text.trim() && (
              <Group className={classnames(styles.block, styles.block_text)}>
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
              </Group>
            )}

            {groupped.image && groupped.image.length > 0 && (
              <div className={classnames(styles.block, styles.block_image)}>
                <CommentImageGrid
                  files={groupped.image}
                  onClick={onImageClick}
                />
              </div>
            )}

            {groupped.audio &&
              groupped.audio.length > 0 &&
              groupped.audio.map((file) => (
                <div
                  className={classnames(styles.block, styles.block_audio)}
                  key={file.id}
                >
                  <AudioPlayer file={file} />
                </div>
              ))}
          </div>
        </div>

        <div className={styles.date}>
          {getPrettyDate(comment.created_at)}
          <CommentLike
            onLike={onLike}
            count={comment.like_count}
            active={canLike}
            liked={comment.liked}
          />
        </div>
      </div>
    );
  },
);

export { CommentContent };
