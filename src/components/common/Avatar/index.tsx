import React, { forwardRef, useCallback } from 'react';

import classNames from 'classnames';

import { Square } from '~/components/common/Square';
import { PRESETS } from '~/constants/urls';
import { getURLFromString } from '~/utils/dom';
import { DivProps } from '~/utils/types';
import { openUserProfile } from '~/utils/user';

import styles from './styles.module.scss';



interface Props extends DivProps {
  url?: string;
  username?: string;
  size?: number;
  preset?: typeof PRESETS[keyof typeof PRESETS];
}

const Avatar = forwardRef<HTMLDivElement, Props>(
  ({ url, username, size, className, preset = PRESETS.avatar, ...rest }, ref) => {
    const onOpenProfile = useCallback(() => openUserProfile(username), [username]);

    return (
      <Square
        {...rest}
        image={getURLFromString(url, preset)}
        className={classNames(styles.avatar, className)}
        onClick={onOpenProfile}
        size={size}
        ref={ref}
      />
    );
  }
);

export { Avatar };
