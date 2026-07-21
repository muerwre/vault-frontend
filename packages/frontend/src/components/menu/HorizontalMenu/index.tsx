import { PropsWithChildren } from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/common/Icon';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface HorizontalMenuProps extends DivProps {}
interface HorizontalMenuItemProps {
  isLoading?: boolean;
  icon?: string;
  color?: 'green' | 'orange' | 'yellow';
  active?: boolean;
  stretchy?: boolean;
  onClick?: () => void;
}

function HorizontalMenu({ children, ...props }: HorizontalMenuProps) {
  return (
    <div {...props} className={classNames(styles.menu, props.className)}>
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
      )}
      onClick={onClick}
    >
      {!!icon && <Icon icon={icon} size={24} />}
      <span className={styles.text}>{children}</span>
    </div>
  );
};
export { HorizontalMenu };
