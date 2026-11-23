import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FC,
  memo,
  ReactNode,
  useMemo,
} from 'react';

import Tippy from '@tippyjs/react';
import classnames from 'classnames';

import { LoaderCircle } from '~/components/common/LoaderCircle';

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
    | 'flow'
    | 'lab'
    | 'profile'
    | 'outline-white'
    | 'flat';
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
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
    }, [size]);

    return (
      <Tippy content={label || ''} disabled={!label}>
        <button className={computedClassName} {...props}>
          {iconLeft && (
            <span key={0} className={styles.icon_left}>
              {iconLeft}
            </span>
          )}
          {!!title ? <span>{title}</span> : children}
          {iconRight && (
            <span key={2} className={styles.icon_right}>
              {iconRight}
            </span>
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
