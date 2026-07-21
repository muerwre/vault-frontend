import { forwardRef } from 'react';

import classNames from 'classnames';

import { Square } from '~/components/common/Square';
import { imagePresets } from '~/constants/urls';
import { getURLFromString } from '~/utils/dom';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends DivProps {
  url?: string;
  username?: string;
  size?: number;
  hasUpdates?: boolean;
  preset?: (typeof imagePresets)[keyof typeof imagePresets];
}

const Avatar = forwardRef<HTMLDivElement, Props>(
  (
    {
      url,
      username,
      size,
      className,
      preset = imagePresets.avatar,
      hasUpdates,
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        {...rest}
        className={classNames(styles.container, {
          [styles.has_dot]: hasUpdates,
        })}
      >
        <Square
          image={getURLFromString(url, preset) || '/images/john_doe.svg'}
          className={classNames(styles.avatar, className)}
          size={size}
          ref={ref}
        >
          {children}
        </Square>
      </div>
    );
  },
);

export { Avatar };
