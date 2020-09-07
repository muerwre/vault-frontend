import React, { FC, useCallback } from 'react';
import { IMessage } from '~/redux/types';
import styles from './styles.scss';
import { formatText, getURL, getPrettyDate } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import classNames from 'classnames';
import { Group } from '~/components/containers/Group';
import { CommentMenu } from '~/components/node/CommentMenu';
import { MessageForm } from '~/components/profile/MessageForm';

interface IProps {
  message: IMessage;
  incoming: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isEditing: boolean;
}

const Message: FC<IProps> = ({ message, incoming, onEdit, onDelete, isEditing }) => {
  const onEditClicked = useCallback(() => onEdit(message.id), [message.id]);
  const onDeleteClicked = useCallback(() => onDelete(message.id), [message.id]);

  return (
    <div className={classNames(styles.message, { [styles.incoming]: incoming })}>
      {isEditing ? (
        <div className={styles.form}>
          <MessageForm id={message.id} text={message.text} />
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
