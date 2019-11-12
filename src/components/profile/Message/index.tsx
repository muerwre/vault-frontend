import React, { FC } from 'react';
import { IMessage } from '~/redux/types';
import styles from './styles.scss';
import { formatText, getURL, getPrettyDate } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import classNames from 'classnames';
import { Group } from '~/components/containers/Group';

interface IProps {
  message: IMessage;
  incoming: boolean;
}

const Message: FC<IProps> = ({ message, incoming }) => (
  <div className={classNames(styles.message, { [styles.incoming]: incoming })}>
    <Group className={styles.text} dangerouslySetInnerHTML={{ __html: formatText(message.text) }} />

    <div
      className={styles.avatar}
      style={{ backgroundImage: `url("${getURL(message.from.photo, PRESETS.avatar)}")` }}
    />

    <div className={styles.stamp}>{getPrettyDate(message.created_at)}</div>
  </div>
);

export { Message };
