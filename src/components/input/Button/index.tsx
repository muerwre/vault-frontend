import classnames from 'classnames';
import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FC,
  createElement,
  memo,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { IIcon } from '~/redux/types';
import { usePopper } from 'react-popper';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';

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
  is_loading?: boolean;
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
    seamless = false,
    transparent = false,
    is_loading,
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
          seamless,
          transparent,
          disabled,
          is_loading,
          stretchy,
          icon: ((iconLeft || iconRight) && !title && !children) || iconOnly,
          has_icon_left: !!iconLeft,
          has_icon_right: !!iconRight,
          round,
        }),
      [seamless, round, disabled, className, is_loading, stretchy, iconLeft, iconRight, size, color]
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
