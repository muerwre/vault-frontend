import React, { FC } from 'react';

import classNames from 'classnames';

import { Group } from '~/components/containers/Group';
import { ImagePresets } from '~/constants/urls';
import markdown from '~/styles/common/markdown.module.scss';
import { IMessage } from '~/types';
import { formatText, getPrettyDate, getURL } from '~/utils/dom';

import styles from './styles.module.scss';

interface IProps {
  message: IMessage;
  incoming: boolean;
}

const Message: FC<IProps> = ({ message, incoming }) => {
  return (
    <div className={classNames(styles.message, { [styles.incoming]: incoming })}>
      <div className={styles.text}>
        <Group
          dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
          className={markdown.wrapper}
        />
      </div>

      <div
        className={styles.avatar}
        style={{ backgroundImage: `url("${getURL(message.from.photo, ImagePresets.avatar)}")` }}
      />

      <div className={styles.stamp}>{getPrettyDate(message.created_at)}</div>
    </div>
  );
};
export { Message };
