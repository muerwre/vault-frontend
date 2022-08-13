import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FC,
  memo,
  useMemo,
} from 'react';

import Tippy from '@tippyjs/react';
import classnames from 'classnames';

import { Icon } from '~/components/input/Icon';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { IIcon } from '~/types';

import styles from './styles.module.scss';

type IButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  size?: 'mini' | 'normal' | 'big' | 'giant' | 'micro' | 'small';
  color?:
    | 'primary'
    | 'danger'
    | 'info'
    | 'outline'
    | 'link'
    | 'gray'
    | 'lab'
    | 'outline-white'
    | 'flat';
  iconLeft?: IIcon;
  iconRight?: IIcon;
  title?: string;
  stretchy?: boolean;
  iconOnly?: boolean;
  label?: string;
  round?: boolean;
  loading?: boolean;
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
    loading,
    ...props
  }) => {
    const computedClassName = useMemo(
      () =>
        classnames(styles.button, className, styles[size], styles[color], {
          disabled,
          stretchy,
          icon: ((iconLeft || iconRight) && !title && !children) || iconOnly,
          [styles.has_icon_left]: !!iconLeft,
          [styles.has_icon_right]: !!iconRight,
          round,
        }),
      [
        className,
        size,
        color,
        disabled,
        stretchy,
        iconLeft,
        iconRight,
        title,
        children,
        iconOnly,
        round,
      ],
    );

    const loaderSize = useMemo(() => {
      if (['small', 'micro', 'mini'].includes(size)) {
        return 16;
      }

      return 24;
    }, []);

    return (
      <Tippy content={label || ''} disabled={!label}>
        <button className={computedClassName} {...props}>
          {iconLeft && (
            <Icon
              icon={iconLeft}
              size={20}
              key={0}
              className={styles.icon_left}
            />
          )}
          {!!title ? <span>{title}</span> : children}
          {iconRight && (
            <Icon
              icon={iconRight}
              size={20}
              key={2}
              className={styles.icon_right}
            />
          )}
          {loading && (
            <div className={styles.loading}>
              <LoaderCircle size={loaderSize} />
            </div>
          )}
        </button>
      </Tippy>
    );
  },
);

export { Button };
