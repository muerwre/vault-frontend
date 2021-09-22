import React, { FC, useCallback } from 'react';
import { getURLFromString } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { openUserProfile } from '~/utils/user';

interface Props {
  url?: string;
  username?: string;
  size?: number;
  className?: string;
}

const CommentAvatar: FC<Props> = ({ url, username, size, className }) => {
  const backgroundImage = !!url ? `url('${getURLFromString(url, PRESETS.avatar)}')` : undefined;
  const onOpenProfile = useCallback(() => openUserProfile(username), [username]);

  return (
    <div
      className={classNames(styles.avatar, className)}
      style={{ backgroundImage }}
      onClick={onOpenProfile}
    />
  );
};

export { CommentAvatar };
