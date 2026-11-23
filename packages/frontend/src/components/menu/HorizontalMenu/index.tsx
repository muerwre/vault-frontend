import { Children, PropsWithChildren, ReactNode } from 'react';

import classNames from 'classnames';

import { Placeholder } from '~/components/placeholders/Placeholder';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface HorizontalMenuProps extends DivProps {}
interface HorizontalMenuItemProps {
  isLoading?: boolean;
  icon?: ReactNode;
  color?: 'green' | 'orange' | 'yellow' | 'flow' | 'lab' | 'profile';
  active?: boolean;
  stretchy?: boolean;
  /** Puts the label below the icon. */
  vertical?: boolean;
  /** Dims the item and ignores clicks. */
  disabled?: boolean;
  /** Tooltip; useful when the item shows only its icon. */
  title?: string;
  className?: string;
  onClick?: () => void;
}

function HorizontalMenu({ children, ...props }: HorizontalMenuProps) {
  // with more than two options, lines between them help tell them apart
  const separated = Children.toArray(children).length > 2;

  return (
    <div
      {...props}
      className={classNames(
        styles.menu,
        { [styles.separated]: separated },
        props.className,
      )}
    >
      {children}
    </div>
  );
}

HorizontalMenu.Item = ({
  icon,
  color = 'green',
  children,
  isLoading,
  active,
  stretchy,
  vertical,
  disabled,
  title,
  className,
  onClick,
}: PropsWithChildren<HorizontalMenuItemProps>) => {
  if (isLoading) {
    return (
      <div className={styles.item} key="loading">
        <Placeholder width="32px" height={32} />
        <Placeholder width="96px" height={18} />
      </div>
    );
  }

  return (
    <div
      className={classNames(
        styles.item,
        {
          [styles.active]: active,
          [styles.stretchy]: stretchy,
          [styles.vertical]: vertical,
          [styles.disabled]: disabled,
        },
        styles[color],
        className,
      )}
      onClick={disabled ? undefined : onClick}
      title={title}
      aria-disabled={disabled || undefined}
    >
      {icon}
      {!!children && <span className={styles.text}>{children}</span>}
    </div>
  );
};
export { HorizontalMenu };
