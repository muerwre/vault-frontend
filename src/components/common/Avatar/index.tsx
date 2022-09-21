import React, { forwardRef } from 'react';

import classNames from 'classnames';

import { Square } from '~/components/common/Square';
import { ImagePresets } from '~/constants/urls';
import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';
import { getURLFromString } from '~/utils/dom';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends DivProps {
  url?: string;
  username?: string;
  size?: number;
  preset?: typeof ImagePresets[keyof typeof ImagePresets];
}

const Avatar = forwardRef<HTMLDivElement, Props>(
  (
    { url, username, size, className, preset = ImagePresets.avatar, ...rest },
    ref,
  ) => {
    return (
      <Square
        {...rest}
        image={getURLFromString(url, preset) || '/images/john_doe.svg'}
        className={classNames(styles.avatar, className)}
        size={size}
        ref={ref}
      />
    );
  },
);

export { Avatar };
