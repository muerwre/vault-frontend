import React, { FC, KeyboardEventHandler, useCallback, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import { Textarea } from '~/components/input/Textarea';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';
import { Group } from '~/components/containers/Group';
import { connect } from 'react-redux';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import * as MESSAGES_ACTIONS from '~/redux/messages/actions';
import { ERROR_LITERAL } from '~/constants/errors';
import { selectMessages } from '~/redux/messages/selectors';

const mapStateToProps = state => ({
  messages: selectMessages(state),
});

const mapDispatchToProps = {
  messagesSendMessage: MESSAGES_ACTIONS.messagesSendMessage,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    id?: number;
    text?: string;
    onCancel?: () => void;
  };

const MessageFormUnconnected: FC<IProps> = ({
  messages: { is_sending_messages, is_loading_messages, error },
  messagesSendMessage,

  id = 0,
  text: initialText = '',
  onCancel,
}) => {
  const isEditing = useMemo(() => id > 0, [id]);
  const [text, setText] = useState(initialText);

  const onSuccess = useCallback(() => {
    setText('');

    if (isEditing && onCancel) {
      onCancel();
    }
  }, [setText, isEditing, onCancel]);

  const onSubmit = useCallback(() => {
    messagesSendMessage({ text, id }, onSuccess);
  }, [messagesSendMessage, text, id, onSuccess]);

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(
    ({ ctrlKey, key }) => {
      if (ctrlKey && key === 'Enter') onSubmit();
    },
    [onSubmit]
  );

  return (
    <div className={styles.wrap}>
      {error && <div className={styles.error}>{ERROR_LITERAL[error]}</div>}
      {is_loading_messages && !error && (
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
          maxRows={isEditing ? 15 : 5}
          onKeyDown={onKeyDown}
          disabled={is_sending_messages}
          autoFocus
        />

        <Group className={styles.buttons} horizontal>
          <Filler />

          {is_sending_messages && <LoaderCircle size={20} />}

          {isEditing && (
            <Button size="small" color="link" onClick={onCancel}>
              Отмена
            </Button>
          )}

          <Button
            size="small"
            color="gray"
            iconRight="enter"
            disabled={is_sending_messages}
            onClick={onSubmit}
          >
            {isEditing ? 'Схоронить' : 'Сказать'}
          </Button>
        </Group>
      </Group>
    </div>
  );
};

const MessageForm = connect(mapStateToProps, mapDispatchToProps)(MessageFormUnconnected);

export { MessageForm };
