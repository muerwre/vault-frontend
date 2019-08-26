import React, { FC, useCallback, useState, ChangeEvent, ChangeEventHandler } from 'react';
import { Textarea } from '~/components/input/Textarea';
import { CommentWrapper } from '~/components/containers/CommentWrapper';
import * as styles from './styles.scss';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import assocPath from 'ramda/es/assocPath';
import { InputHandler, INode } from '~/redux/types';

interface IProps {
  id: INode['id'];
}

const CommentForm: FC<IProps> = ({ id }) => {
  const [data, setData] = useState({ text: '' });

  const onInput = useCallback<InputHandler>(
    text => {
      setData(assocPath(['text'], text, data));
    },
    [setData, data]
  );

  const onSubmit = useCallback(
    event => {
      event.preventDefault();
      console.log({ data });
    },
    [data]
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

export { CommentForm };
