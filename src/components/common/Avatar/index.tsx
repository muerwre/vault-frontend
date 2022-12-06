import React, { forwardRef } from 'react';

import classNames from 'classnames';

import { Square } from '~/components/common/Square';
import { imagePresets } from '~/constants/urls';
import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';
import { getURLFromString } from '~/utils/dom';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends DivProps {
  url?: string;
  username?: string;
  size?: number;
  preset?: typeof imagePresets[keyof typeof imagePresets];
}

const Avatar = forwardRef<HTMLDivElement, Props>(
  (
    { url, username, size, className, preset = imagePresets.avatar, ...rest },
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
