import React, { FC, useState, useCallback, KeyboardEventHandler } from 'react';
import styles from './styles.scss';
import { Textarea } from '~/components/input/Textarea';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import { Group } from '~/components/containers/Group';
import { selectAuthProfile } from '~/redux/auth/selectors';
import { connect } from 'react-redux';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { ERROR_LITERAL } from '~/constants/errors';

const mapStateToProps = state => ({
  profile: selectAuthProfile(state),
});

const mapDispatchToProps = {
  authSendMessage: AUTH_ACTIONS.authSendMessage,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    id?: number;
    text?: string;
  };

const MessageFormUnconnected: FC<IProps> = ({
  id = 0,
  text: initialText = '',
  profile: { is_sending_messages, is_loading_messages, messages_error },
  authSendMessage,
}) => {
  const [text, setText] = useState(initialText);

  const onSuccess = useCallback(() => {
    setText('');
  }, [setText]);

  const onSubmit = useCallback(() => {
    authSendMessage({ text, id }, onSuccess);
  }, [authSendMessage, text, id, onSuccess]);

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(
    ({ ctrlKey, key }) => {
      if (!!ctrlKey && key === 'Enter') onSubmit();
    },
    [onSubmit]
  );

  return (
    <div className={styles.wrap}>
      {messages_error && <div className={styles.error}>{ERROR_LITERAL[messages_error]}</div>}
      {is_loading_messages && !messages_error && (
        <Group className={styles.loader} horizontal>
          <LoaderCircle size={20} />
          <div>Обновляем</div>
        </Group>
      )}
      <Group className={styles.content}>
        <Textarea
          value={text}
          handler={setText}
          minRows={1}
          maxRows={4}
          seamless
          onKeyDown={onKeyDown}
          disabled={is_sending_messages}
          autoFocus
        />

        <Group className={styles.buttons} horizontal>
          <Filler />

          {is_sending_messages && <LoaderCircle size={20} />}

          <Button
            size="small"
            color="gray"
            iconRight="enter"
            disabled={is_sending_messages}
            onClick={onSubmit}
          >
            Сказать
          </Button>
        </Group>
      </Group>
    </div>
  );
};

const MessageForm = connect(mapStateToProps, mapDispatchToProps)(MessageFormUnconnected);

export { MessageForm };
