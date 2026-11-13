import { Children, PropsWithChildren } from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/common/Icon';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface HorizontalMenuProps extends DivProps {}
interface HorizontalMenuItemProps {
  isLoading?: boolean;
  icon?: string;
  color?: 'green' | 'orange' | 'yellow' | 'flow' | 'lab';
  active?: boolean;
  stretchy?: boolean;
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
        { [styles.active]: active, [styles.stretchy]: stretchy },
        styles[color],
        className,
      )}
      onClick={onClick}
      title={title}
    >
      {!!icon && <Icon icon={icon} size={24} />}
      {!!children && <span className={styles.text}>{children}</span>}
    </div>
  );
};
export { HorizontalMenu };
