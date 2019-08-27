import React, { FC, useCallback, useEffect } from 'react';
import { Textarea } from '~/components/input/Textarea';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import * as styles from './styles.scss';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import assocPath from 'ramda/es/assocPath';
import { InputHandler, INode } from '~/redux/types';
import { connect } from 'react-redux';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { store } from '~/redux/store';
import { selectNode } from '~/redux/node/selectors';

const mapStateToProps = selectNode;
const mapDispatchToProps = {
  nodePostComment: NODE_ACTIONS.nodePostComment,
  nodeSetCommentData: NODE_ACTIONS.nodeSetCommentData,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    id: INode['id'];
  };

const CommentFormUnconnected: FC<IProps> = ({
  nodePostComment,
  nodeSetCommentData,
  comment_data,
  id,
}) => {
  // const [data, setData] = useState<IComment>({ ...EMPTY_COMMENT });

  const onInput = useCallback<InputHandler>(
    text => {
      nodeSetCommentData(assocPath(['text'], text, comment_data));
    },
    [nodeSetCommentData, comment_data]
  );

  const onSubmit = useCallback(
    event => {
      event.preventDefault();
      nodePostComment();
    },
    [nodePostComment]
  );

  useEffect(() => {
    store.subscribe(console.log);
  }, []);

  return (
    <CommentWrapper>
      <form onSubmit={onSubmit}>
        <div className={styles.input}>
          <Textarea value={comment_data.text} handler={onInput} />
        </div>
        <div className={styles.buttons}>
          <Filler />
          <Button size="mini" grey iconRight="enter">
            Сказать
          </Button>
        </div>
      </form>
    </CommentWrapper>
  );
};

const CommentForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommentFormUnconnected);

export { CommentForm, CommentFormUnconnected };
