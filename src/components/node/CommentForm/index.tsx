import React, { FC, useCallback, KeyboardEventHandler, useEffect } from 'react';
import { Textarea } from '~/components/input/Textarea';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import * as styles from './styles.scss';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import assocPath from 'ramda/es/assocPath';
import { InputHandler, IFileWithUUID } from '~/redux/types';
import { connect } from 'react-redux';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { selectNode } from '~/redux/node/selectors';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { Group } from '~/components/containers/Group';
import { UPLOAD_SUBJECTS, UPLOAD_TARGETS } from '~/redux/uploads/constants';
import uuid from 'uuid4';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { selectUploads } from '~/redux/uploads/selectors';
import { IState } from '~/redux/store';
import { getFileType } from '~/utils/uploader';
import { selectUser } from '~/redux/auth/selectors';
import { getURL } from '~/utils/dom';

const mapStateToProps = (state: IState) => ({
  node: selectNode(state),
  user: selectUser(state),
  uploads: selectUploads(state),
});

const mapDispatchToProps = {
  nodePostComment: NODE_ACTIONS.nodePostComment,
  nodeSetCommentData: NODE_ACTIONS.nodeSetCommentData,
  uploadUploadFiles: UPLOAD_ACTIONS.uploadUploadFiles,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    id: number;
  };

const CommentFormUnconnected: FC<IProps> = ({
  node: { comment_data, is_sending_comment },
  uploads: { statuses, files },
  user: { photo },
  id,
  nodePostComment,
  nodeSetCommentData,
  uploadUploadFiles,
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

  const onSubmit = useCallback(
    event => {
      if (event) event.preventDefault();
      nodePostComment(id);
    },
    [nodePostComment, id]
  );

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(
    ({ ctrlKey, key }) => {
      if (!!ctrlKey && key === 'Enter') onSubmit(null);
    },
    [onSubmit]
  );

  useEffect(() => {
    const temp_ids = (comment_data && comment_data[id] && comment_data[id].temp_ids) || [];
    const added_files = temp_ids
      .map(temp_uuid => statuses[temp_uuid] && statuses[temp_uuid].uuid)
      .map(el => !!el && files[el])
      .filter(el => !!el && !comment_data[id].files.some(file => file.id === el.id));

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

  return (
    <CommentWrapper photo={getURL(photo)}>
      <form onSubmit={onSubmit}>
        <div className={styles.input}>
          <Textarea
            value={comment.text}
            handler={onInput}
            onKeyDown={onKeyDown}
            disabled={is_sending_comment}
          />
        </div>

        <Group horizontal className={styles.buttons}>
          <input type="file" onInput={onInputChange} multiple accept="image/*" />
          <input type="file" onInput={onInputChange} multiple accept="audio/*" />

          <Filler />

          {is_sending_comment && <LoaderCircle size={20} />}

          <Button size="mini" grey iconRight="enter" disabled={is_sending_comment}>
            Сказать
          </Button>
        </Group>
      </form>

      {comment.temp_ids.map(
        temp_id =>
          statuses[temp_id] &&
          statuses[temp_id].is_uploading && (
            <div key={statuses[temp_id].temp_id}>{statuses[temp_id].progress}</div>
          )
      )}

      {comment.files.map(file => file.name && <div key={file.id}>{file.name}</div>)}
    </CommentWrapper>
  );
};

const CommentForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommentFormUnconnected);

export { CommentForm, CommentFormUnconnected };
