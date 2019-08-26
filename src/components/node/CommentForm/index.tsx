import React, { FC, useCallback, useState } from 'react';
import { Textarea } from '~/components/input/Textarea';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import * as styles from './styles.scss';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import assocPath from 'ramda/es/assocPath';
import { InputHandler, INode, IComment } from '~/redux/types';
import { connect } from 'react-redux';
import * as NODE_ACTIONS from '~/redux/node/actions';
import { EMPTY_COMMENT } from '~/redux/node/constants';

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  nodePostComment: NODE_ACTIONS.nodePostComment,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    id: INode['id'];
  };

const CommentFormUnconnected: FC<IProps> = ({ nodePostComment, id }) => {
  const [data, setData] = useState<IComment>({ ...EMPTY_COMMENT });

  const onInput = useCallback<InputHandler>(
    text => {
      setData(assocPath(['text'], text, data));
    },
    [setData, data]
  );

  const onSubmit = useCallback(
    event => {
      event.preventDefault();
      nodePostComment(data, id);
    },
    [data, nodePostComment, id]
  );

  return (
    <CommentWrapper>
      <form onSubmit={onSubmit}>
        <div className={styles.input}>
          <Textarea value={data.text} handler={onInput} />
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
