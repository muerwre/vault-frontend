import React, { FC, useCallback, KeyboardEventHandler } from 'react';
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
import { UPLOAD_SUBJECTS, UPLOAD_TARGETS, UPLOAD_TYPES } from '~/redux/uploads/constants';
import uuid from 'uuid4';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';

const mapStateToProps = selectNode;
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
  comment_data,
  is_sending_comment,
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

  const comment = comment_data[id];

  return (
    <CommentWrapper>
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
