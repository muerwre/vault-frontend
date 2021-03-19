import classnames from 'classnames';
import React, { ButtonHTMLAttributes, DetailedHTMLProps, FC, memo, useMemo } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { IIcon } from '~/redux/types';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';

type IButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  size?: 'mini' | 'normal' | 'big' | 'giant' | 'micro' | 'small';
  color?: 'primary' | 'secondary' | 'outline' | 'link' | 'gray' | 'lab';
  iconLeft?: IIcon;
  iconRight?: IIcon;
  title?: string;
  stretchy?: boolean;
  iconOnly?: boolean;
  label?: string;
  round?: boolean;
};

const Button: FC<IButtonProps> = memo(
  ({
    className = '',
    color = 'primary',
    size = 'normal',
    iconLeft,
    iconRight,
    children,
    title,
    stretchy,
    disabled,
    iconOnly,
    label,
    ref,
    round,
    ...props
  }) => {
    const computedClassName = useMemo(
      () =>
        classnames(styles.button, className, styles[size], styles[color], {
          disabled,
          stretchy,
          icon: ((iconLeft || iconRight) && !title && !children) || iconOnly,
          has_icon_left: !!iconLeft,
          has_icon_right: !!iconRight,
          round,
        }),
      [round, disabled, className, stretchy, iconLeft, iconRight, size, color]
    );

    return (
      <Tippy content={label || ''} enabled={!!label}>
        <button className={computedClassName} {...props}>
          {iconLeft && <Icon icon={iconLeft} size={20} key={0} className={styles.icon_left} />}
          {!!title ? <span>{title}</span> : children}
          {iconRight && <Icon icon={iconRight} size={20} key={2} className={styles.icon_right} />}
        </button>
      </Tippy>
    );
  }
);

export { Button };
