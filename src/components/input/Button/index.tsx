import classnames from 'classnames';
import React, { ButtonHTMLAttributes, DetailedHTMLProps, FC, createElement, memo } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { IIcon } from '~/redux/types';

type IButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  size?: 'mini' | 'normal' | 'big' | 'giant' | 'micro' | 'small';
  color?: 'primary' | 'secondary' | 'outline' | 'link' | 'gray';
  iconLeft?: IIcon;
  iconRight?: IIcon;
  seamless?: boolean;
  transparent?: boolean;
  title?: string;
  non_submitting?: boolean;
  is_loading?: boolean;
  stretchy?: boolean;
  iconOnly?: boolean;
};

const Button: FC<IButtonProps> = memo(
  ({
    className = '',
    color = 'primary',
    size = 'normal',
    iconLeft,
    iconRight,
    children,
    seamless = false,
    transparent = false,
    non_submitting = false,
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
        className: classnames(styles.button, className, styles[size], styles[color], {
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
        iconLeft && <Icon icon={iconLeft} size={20} key={0} className={styles.icon_left} />,
        title ? <span>{title}</span> : children || null,
        iconRight && <Icon icon={iconRight} size={20} key={2} className={styles.icon_right} />,
      ]
    )
);

export { Button };
