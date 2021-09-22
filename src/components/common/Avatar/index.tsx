import React, { FC, useCallback } from 'react';
import { getURLFromString } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { openUserProfile } from '~/utils/user';
import { DivProps } from '~/utils/types';

interface Props extends DivProps {
  url?: string;
  username?: string;
  size?: number;
  innerRef?: React.Ref<any>;
}

const Avatar: FC<Props> = ({ url, username, size, className, innerRef, ...rest }) => {
  const backgroundImage = !!url ? `url('${getURLFromString(url, PRESETS.avatar)}')` : undefined;
  const onOpenProfile = useCallback(() => openUserProfile(username), [username]);

  return (
    <div
      {...rest}
      className={classNames(styles.avatar, className)}
      style={{ backgroundImage }}
      onClick={onOpenProfile}
      ref={innerRef}
    />
  );
};

export { Avatar };
