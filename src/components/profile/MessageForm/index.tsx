import React, { FC, useState, useCallback } from 'react';
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

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const MessageFormUnconnected: FC<IProps> = ({
  profile: { is_sending_messages, messages_error },
  authSendMessage,
}) => {
  const [text, setText] = useState('');

  const onSuccess = useCallback(() => {
    setText('');
  }, [setText]);

  const onSubmit = useCallback(() => {
    authSendMessage({ text }, onSuccess);
  }, [authSendMessage, text, onSuccess]);

  return (
    <div className={styles.wrap}>
      {messages_error && <div className={styles.error}>{ERROR_LITERAL[messages_error]}</div>}

      <Group className={styles.content}>
        <Textarea value={text} handler={setText} minRows={1} maxRows={4} seamless />

        <div className={styles.buttons}>
          <Filler />

          {is_sending_messages && <LoaderCircle size={20} />}

          <Button
            size="small"
            grey
            iconRight="enter"
            disabled={is_sending_messages}
            onClick={onSubmit}
          >
            Сказать
          </Button>
        </div>
      </Group>
    </div>
  );
};

const MessageForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageFormUnconnected);

export { MessageForm };
