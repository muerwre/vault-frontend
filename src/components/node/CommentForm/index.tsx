import React, { FC, useCallback, KeyboardEventHandler, useEffect, useMemo } from 'react';
import { Textarea } from '~/components/input/Textarea';
import * as styles from './styles.scss';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import assocPath from 'ramda/es/assocPath';
import { InputHandler, IFileWithUUID, IFile } from '~/redux/types';
import { connect } from 'react-redux';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { selectNode } from '~/redux/node/selectors';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { Group } from '~/components/containers/Group';
import { UPLOAD_SUBJECTS, UPLOAD_TARGETS, UPLOAD_TYPES } from '~/redux/uploads/constants';
import uuid from 'uuid4';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { selectUploads } from '~/redux/uploads/selectors';
import { IState } from '~/redux/store';
import { getFileType } from '~/utils/uploader';
import { ButtonGroup } from '~/components/input/ButtonGroup';
import { SortableImageGrid } from '~/components/editors/SortableImageGrid';
import { moveArrItem } from '~/utils/fn';
import { SortEnd } from 'react-sortable-hoc';
import { SortableAudioGrid } from '~/components/editors/SortableAudioGrid';

const mapStateToProps = (state: IState) => ({
  node: selectNode(state),
  uploads: selectUploads(state),
});

const mapDispatchToProps = {
  nodePostComment: NODE_ACTIONS.nodePostComment,
  nodeCancelCommentEdit: NODE_ACTIONS.nodeCancelCommentEdit,
  nodeSetCommentData: NODE_ACTIONS.nodeSetCommentData,
  uploadUploadFiles: UPLOAD_ACTIONS.uploadUploadFiles,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    id: number;
    is_before?: boolean;
  };

const CommentFormUnconnected: FC<IProps> = ({
  node: { comment_data, is_sending_comment },
  uploads: { statuses, files },
  id,
  is_before = false,
  nodePostComment,
  nodeSetCommentData,
  uploadUploadFiles,
  nodeCancelCommentEdit,
}) => {
  const onInputChange = useCallback(
    event => {
      event.preventDefault();

      if (!event.target.files || !event.target.files.length) return;

      const items: IFileWithUUID[] = Array.from(event.target.files).map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject: UPLOAD_SUBJECTS.COMMENT,
          target: UPLOAD_TARGETS.COMMENTS,
          type: getFileType(file),
        })
      );

      const temps = items.map(file => file.temp_id);

      nodeSetCommentData(
        id,
        assocPath(['temp_ids'], [...comment_data[id].temp_ids, ...temps], comment_data[id])
      );
      uploadUploadFiles(items);
    },
    [uploadUploadFiles, comment_data, id, nodeSetCommentData]
  );

  const onInput = useCallback<InputHandler>(
    text => {
      nodeSetCommentData(id, assocPath(['text'], text, comment_data[id]));
    },
    [nodeSetCommentData, comment_data, id]
  );

  useEffect(() => {
    const temp_ids = (comment_data && comment_data[id] && comment_data[id].temp_ids) || [];
    const added_files = temp_ids
      .map(temp_uuid => statuses[temp_uuid] && statuses[temp_uuid].uuid)
      .map(el => !!el && files[el])
      .filter(el => !!el && !comment_data[id].files.some(file => file && file.id === el.id));

    const filtered_temps = temp_ids.filter(
      temp_id =>
        statuses[temp_id] &&
        (!statuses[temp_id].uuid || !added_files.some(file => file.id === statuses[temp_id].uuid))
    );

    if (added_files.length) {
      nodeSetCommentData(id, {
        ...comment_data[id],
        temp_ids: filtered_temps,
        files: [...comment_data[id].files, ...added_files],
      });
    }
  }, [statuses, files]);

  const comment = comment_data[id];

  const is_uploading_files = useMemo(() => comment.temp_ids.length > 0, [comment.temp_ids]);

  const onSubmit = useCallback(
    event => {
      if (event) event.preventDefault();
      if (is_uploading_files || is_sending_comment) return;

      nodePostComment(id, is_before);
    },
    [nodePostComment, id, is_before, is_uploading_files, is_sending_comment]
  );

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(
    ({ ctrlKey, key }) => {
      if (!!ctrlKey && key === 'Enter') onSubmit(null);
    },
    [onSubmit]
  );

  const images = useMemo(
    () => comment.files.filter(file => file && file.type === UPLOAD_TYPES.IMAGE),
    [comment.files]
  );

  const locked_images = useMemo(
    () =>
      comment.temp_ids
        .filter(temp => statuses[temp] && statuses[temp].type === UPLOAD_TYPES.IMAGE)
        .map(temp_id => statuses[temp_id]),
    [statuses, comment.temp_ids]
  );

  const audios = useMemo(
    () => comment.files.filter(file => file && file.type === UPLOAD_TYPES.AUDIO),
    [comment.files]
  );

  const locked_audios = useMemo(
    () =>
      comment.temp_ids
        .filter(temp => statuses[temp] && statuses[temp].type === UPLOAD_TYPES.AUDIO)
        .map(temp_id => statuses[temp_id]),
    [statuses, comment.temp_ids]
  );

  const onFileDrop = useCallback(
    (file_id: IFile['id']) => {
      nodeSetCommentData(
        id,
        assocPath(['files'], comment.files.filter(file => file.id != file_id), comment_data[id])
      );
    },
    [comment_data, id, nodeSetCommentData]
  );

  const onImageMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      nodeSetCommentData(
        id,
        assocPath(
          ['files'],
          [
            ...audios,
            ...(moveArrItem(oldIndex, newIndex, images.filter(file => !!file)) as IFile[]),
          ],
          comment_data[id]
        )
      );
    },
    [images, audios]
  );

  const onAudioMove = useCallback(
    ({ oldIndex, newIndex }: SortEnd) => {
      nodeSetCommentData(
        id,
        assocPath(
          ['files'],
          [
            ...images,
            ...(moveArrItem(oldIndex, newIndex, audios.filter(file => !!file)) as IFile[]),
          ],
          comment_data[id]
        )
      );
    },
    [images, audios]
  );

  const onCancelEdit = useCallback(() => {
    nodeCancelCommentEdit(id);
  }, [nodeCancelCommentEdit, comment.id]);

  return (
    <form onSubmit={onSubmit} className={styles.wrap}>
      <div className={styles.input}>
        <Textarea
          value={comment.text}
          handler={onInput}
          onKeyDown={onKeyDown}
          disabled={is_sending_comment}
          minRows={2}
        />
      </div>

      {(!!images.length || !!audios.length) && (
        <div className={styles.attaches}>
          {!!images.length && (
            <SortableImageGrid
              onDrop={onFileDrop}
              onSortEnd={onImageMove}
              axis="xy"
              items={images}
              locked={locked_images}
              pressDelay={50}
              helperClass={styles.helper}
              size={120}
            />
          )}

          {(!!audios.length || !!locked_audios.length) && (
            <SortableAudioGrid
              items={audios}
              onDrop={onFileDrop}
              onSortEnd={onAudioMove}
              axis="y"
              locked={locked_audios}
              pressDelay={50}
              helperClass={styles.helper}
            />
          )}
        </div>
      )}

      <Group horizontal className={styles.buttons}>
        <ButtonGroup>
          <Button iconLeft="photo" size="small" color="gray" iconOnly>
            <input type="file" onInput={onInputChange} multiple accept="image/*" />
          </Button>

          <Button iconRight="audio" size="small" color="gray" iconOnly>
            <input type="file" onInput={onInputChange} multiple accept="audio/*" />
          </Button>
        </ButtonGroup>

        <Filler />

        {(is_sending_comment || is_uploading_files) && <LoaderCircle size={20} />}

        {id !== 0 && (
          <Button size="small" color="link" type="button" onClick={onCancelEdit}>
            Отмена
          </Button>
        )}

        <Button
          size="small"
          color="gray"
          iconRight={id === 0 ? 'enter' : 'check'}
          disabled={is_sending_comment || is_uploading_files}
        >
          {id === 0 ? 'Сказать' : 'Сохранить'}
        </Button>
      </Group>
    </form>
  );
};

const CommentForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommentFormUnconnected);

export { CommentForm, CommentFormUnconnected };
