import classnames from 'classnames';
import React, { ButtonHTMLAttributes, DetailedHTMLProps, FC } from 'react';
import * as styles from './styles.scss';
import { Icon } from '~/components/input/Icon';
import { IIcon } from '~/redux/types';

type IButtonProps = DetailedHTMLProps<
ButtonHTMLAttributes<HTMLButtonElement>,
HTMLButtonElement
> & {
  size?: 'mini' | 'normal' | 'big' | 'giant' | 'micro';
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
  ...props
}) => React.createElement(seamless || non_submitting ? 'div' : 'button', {
  className: classnames(styles.button, className, styles[size], {
    red,
    grey,
    seamless,
    transparent,
    disabled: props.disabled,
    icon: (iconLeft || iconRight) && !title && !children,
    is_loading,
    stretchy
  }),
  children: [
    iconLeft && <Icon icon={iconLeft} size={20} key={0} />,
    title ? (
      <span key={1}>{title}</span>
    ) : (
      (children && <span key={1}>{children}</span>) || null
    ),
    iconRight && <Icon icon={iconRight} size={20} key={2} />
  ],
  ...props
});
