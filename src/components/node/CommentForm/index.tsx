import React, { FC, useCallback, KeyboardEventHandler, useEffect } from 'react';
import { Textarea } from '~/components/input/Textarea';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import * as styles from './styles.scss';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import assocPath from 'ramda/es/assocPath';
import { InputHandler, IFileWithUUID, IFile, IComment } from '~/redux/types';
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
import pipe from 'ramda/es/pipe';
import { ImageUpload } from '~/components/upload/ImageUpload';
import { getImageSize } from '~/utils/dom';

const mapStateToProps = (state: IState) => ({
  node: selectNode(state),
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
  id,
  nodePostComment,
  nodeSetCommentData,
  uploadUploadFiles,
}) => {
  // const [data, setData] = useState<IComment>({ ...EMPTY_COMMENT });
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
          type: UPLOAD_TYPES.IMAGE,
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

  const onFileAdd = useCallback(
    (file: IFile, temp_id: string) => {
      const comment = comment_data[id];
      nodeSetCommentData(id, pipe(
        assocPath(['files'], [...comment.files, file]),
        assocPath(['temp_ids'], comment.temp_ids.filter(el => el !== temp_id))
      )(comment) as IComment);
    },
    [nodeSetCommentData, comment_data, id]
  );

  useEffect(() => {
    Object.entries(statuses).forEach(([file_id, status]) => {
      const comment = comment_data[id];

      if (comment.temp_ids.includes(file_id) && !!status.uuid && files[status.uuid]) {
        onFileAdd(files[status.uuid], file_id);
      }
    });
  }, [statuses, comment_data, id, nodeSetCommentData, onFileAdd, files]);

  return (
    <CommentWrapper>
      <form onSubmit={onSubmit}>
        <div className={styles.input}>
          <Textarea
            value={comment_data[id].text}
            handler={onInput}
            onKeyDown={onKeyDown}
            disabled={is_sending_comment}
          />
        </div>

        <div className={styles.uploads}>
          {comment_data[id].files.map(file => (
            <ImageUpload id={file.id} thumb={getImageSize(file.url)} key={file.id} />
          ))}
          {comment_data[id].temp_ids.map(
            status =>
              statuses[status] && (
                <ImageUpload
                  id={statuses[status].uuid}
                  thumb={statuses[status].preview}
                  key={status}
                  progress={statuses[status].progress}
                />
              )
          )}
        </div>

        <Group horizontal className={styles.buttons}>
          <input type="file" onInput={onInputChange} />

          <Filler />

          {is_sending_comment && <LoaderCircle size={20} />}

          <Button size="mini" grey iconRight="enter" disabled={is_sending_comment}>
            Сказать
          </Button>
        </Group>
      </form>
    </CommentWrapper>
  );
};

const CommentForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommentFormUnconnected);

export { CommentForm, CommentFormUnconnected };
