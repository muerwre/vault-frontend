import classnames from 'classnames';
import React, { ButtonHTMLAttributes, DetailedHTMLProps, FC, createElement } from 'react';
import * as styles from './styles.scss';
import { Icon } from '~/components/input/Icon';
import { IIcon } from '~/redux/types';

type IButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  size?: 'mini' | 'normal' | 'big' | 'giant' | 'micro' | 'small';
  iconLeft?: IIcon;
  iconRight?: IIcon;
  seamless?: boolean;
  transparent?: boolean;
  title?: string;
  red?: boolean;
  grey?: boolean;
  non_submitting?: boolean;
  is_loading?: boolean;
  stretchy?: boolean;
  iconOnly?: boolean;
};

export const Button: FC<IButtonProps> = ({
  className = '',
  size = 'normal',
  iconLeft,
  iconRight,
  children,
  seamless = false,
  transparent = false,
  non_submitting = false,
  red = false,
  grey = false,
  is_loading,
  title,
  stretchy,
  disabled,
  iconOnly,
  ...props
}) =>
  createElement(
    seamless || non_submitting ? 'div' : 'button',
    {
      className: classnames(styles.button, className, styles[size], {
        red,
        grey,
        seamless,
        transparent,
        disabled,
        is_loading,
        stretchy,
        icon: ((iconLeft || iconRight) && !title && !children) || iconOnly,
        has_icon_left: !!iconLeft,
        has_icon_right: !!iconRight,
      }),
      ...props,
    },
    [
      iconLeft && <Icon icon={iconLeft} size={20} key={0} />,
      title ? <span>{title}</span> : children || null,
      iconRight && <Icon icon={iconRight} size={20} key={2} />,
    ]
  );
