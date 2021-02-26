import React, {
  FC,
  KeyboardEventHandler,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Textarea } from '~/components/input/Textarea';
import styles from './styles.module.scss';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import assocPath from 'ramda/es/assocPath';
import { IComment, IFileWithUUID, InputHandler } from '~/redux/types';
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
import { useRandomPhrase } from '~/constants/phrases';
import { ERROR_LITERAL } from '~/constants/errors';
import { CommentFormAttaches } from '~/components/comment/CommentFormAttaches';
import { CommentFormAttachButtons } from '~/components/comment/CommentFormAttachButtons';
import { CommentFormDropzone } from '~/components/comment/CommentFormDropzone';
import { CommentFormFormatButtons } from '~/components/comment/CommentFormFormatButtons';
import { LocalCommentForm } from '~/components/comment/LocalCommentForm';

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

const CommentFormUnconnected: FC<IProps> = memo(
  ({
    node: { comment_data, is_sending_comment },
    uploads: { statuses, files },
    id,
    is_before = false,
    nodePostComment,
    nodeSetCommentData,
    uploadUploadFiles,
    nodeCancelCommentEdit,
  }) => {
    const [textarea, setTextarea] = useState<HTMLTextAreaElement>();
    const comment = useMemo(() => comment_data[id], [comment_data, id]);

    const onUpload = useCallback(
      (files: File[]) => {
        const items: IFileWithUUID[] = files.map(
          (file: File): IFileWithUUID => ({
            file,
            temp_id: uuid(),
            subject: UPLOAD_SUBJECTS.COMMENT,
            target: UPLOAD_TARGETS.COMMENTS,
            type: getFileType(file),
          })
        );

        const temps = items.map(file => file.temp_id);

        nodeSetCommentData(id, assocPath(['temp_ids'], [...comment.temp_ids, ...temps], comment));
        uploadUploadFiles(items);
      },
      [uploadUploadFiles, comment, id, nodeSetCommentData]
    );

    const onInput = useCallback<InputHandler>(
      text => {
        nodeSetCommentData(id, assocPath(['text'], text, comment));
      },
      [nodeSetCommentData, comment, id]
    );

    useEffect(() => {
      const temp_ids = (comment && comment.temp_ids) || [];
      const added_files = temp_ids
        .map(temp_uuid => statuses[temp_uuid] && statuses[temp_uuid].uuid)
        .map(el => !!el && files[el])
        .filter(el => !!el && !comment.files.some(file => file && file.id === el.id));

      const filtered_temps = temp_ids.filter(
        temp_id =>
          statuses[temp_id] &&
          (!statuses[temp_id].uuid || !added_files.some(file => file.id === statuses[temp_id].uuid))
      );

      if (added_files.length) {
        nodeSetCommentData(id, {
          ...comment,
          temp_ids: filtered_temps,
          files: [...comment.files, ...added_files],
        });
      }
    }, [statuses, files]);

    const isUploadingNow = useMemo(() => comment.temp_ids.length > 0, [comment.temp_ids]);

    const onSubmit = useCallback(
      event => {
        if (event) event.preventDefault();
        if (isUploadingNow || is_sending_comment) return;

        nodePostComment(id, is_before);
      },
      [nodePostComment, id, is_before, isUploadingNow, is_sending_comment]
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

    const onCancelEdit = useCallback(() => {
      nodeCancelCommentEdit(id);
    }, [nodeCancelCommentEdit, comment.id]);

    const placeholder = useRandomPhrase('SIMPLE');

    const clearError = useCallback(() => nodeSetCommentData(id, { error: '' }), [
      id,
      nodeSetCommentData,
    ]);

    useEffect(() => {
      if (comment.error) clearError();
    }, [comment.files, comment.text]);

    const setData = useCallback(
      (data: Partial<IComment>) => {
        nodeSetCommentData(id, data);
      },
      [nodeSetCommentData, id]
    );

    return (
      <>
        <CommentFormDropzone onUpload={onUpload}>
          <form onSubmit={onSubmit} className={styles.wrap}>
            <div className={styles.input}>
              <Textarea
                value={comment.text}
                handler={onInput}
                onKeyDown={onKeyDown}
                disabled={is_sending_comment}
                placeholder={placeholder}
                minRows={2}
                setRef={setTextarea}
              />

              {comment.error && (
                <div className={styles.error} onClick={clearError}>
                  {ERROR_LITERAL[comment.error] || comment.error}
                </div>
              )}
            </div>

            <CommentFormAttaches
              images={images}
              audios={audios}
              locked_audios={locked_audios}
              locked_images={locked_images}
              comment={comment}
              setComment={setData}
              onUpload={onUpload}
            />

            <Group horizontal className={styles.buttons}>
              <CommentFormAttachButtons onUpload={onUpload} />
              <CommentFormFormatButtons element={textarea} handler={onInput} />

              <Filler />

              {(is_sending_comment || isUploadingNow) && <LoaderCircle size={20} />}

              {id !== 0 && (
                <Button size="small" color="link" type="button" onClick={onCancelEdit}>
                  Отмена
                </Button>
              )}

              <Button
                size="small"
                color="gray"
                iconRight={id === 0 ? 'enter' : 'check'}
                disabled={is_sending_comment || isUploadingNow}
              >
                {id === 0 ? 'Сказать' : 'Сохранить'}
              </Button>
            </Group>
          </form>
        </CommentFormDropzone>

        <LocalCommentForm />
      </>
    );
  }
);

const CommentForm = connect(mapStateToProps, mapDispatchToProps)(CommentFormUnconnected);

export { CommentForm, CommentFormUnconnected };
