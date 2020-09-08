import React, { FC, useCallback } from 'react';
import { IMessage } from '~/redux/types';
import styles from './styles.scss';
import { formatText, getPrettyDate, getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import classNames from 'classnames';
import { Group } from '~/components/containers/Group';
import { CommentMenu } from '~/components/node/CommentMenu';
import { MessageForm } from '~/components/profile/MessageForm';
import { Filler } from '~/components/containers/Filler';
import { Button } from '~/components/input/Button';

interface IProps {
  message: IMessage;
  incoming: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onCancelEdit: () => void;
  isEditing: boolean;
}

const Message: FC<IProps> = ({
  message,
  incoming,
  onEdit,
  onDelete,
  isEditing,
  onCancelEdit,
  onRestore,
}) => {
  const onEditClicked = useCallback(() => onEdit(message.id), [onEdit, message.id]);
  const onDeleteClicked = useCallback(() => onDelete(message.id), [onDelete, message.id]);
  const onRestoreClicked = useCallback(() => onRestore(message.id), [onRestore, message.id]);

  if (message.deleted_at) {
    return (
      <div className={classNames(styles.message)}>
        <Group className={styles.deleted} horizontal>
          <Filler>Сообщение удалено</Filler>
          <Button
            size="mini"
            onClick={onRestoreClicked}
            color="link"
            iconLeft="restore"
            className={styles.restore}
          >
            Восстановить
          </Button>
        </Group>

        <div
          className={styles.avatar}
          style={{ backgroundImage: `url("${getURL(message.from.photo, PRESETS.avatar)}")` }}
        />
      </div>
    );
  }

  return (
    <div className={classNames(styles.message, { [styles.incoming]: incoming })}>
      {isEditing ? (
        <div className={styles.form}>
          <MessageForm id={message.id} text={message.text} onCancel={onCancelEdit} />
        </div>
      ) : (
        <div className={styles.text}>
          {!incoming && <CommentMenu onEdit={onEditClicked} onDelete={onDeleteClicked} />}
          <Group dangerouslySetInnerHTML={{ __html: formatText(message.text) }} />
        </div>
      )}

      <div
        className={styles.avatar}
        style={{ backgroundImage: `url("${getURL(message.from.photo, PRESETS.avatar)}")` }}
      />

      <div className={styles.stamp}>{getPrettyDate(message.created_at)}</div>
    </div>
  );
};
export { Message };
