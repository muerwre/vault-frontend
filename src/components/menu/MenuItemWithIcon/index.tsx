import React, { FC } from 'react';

import { Icon } from '~/components/common/Icon';

import styles from './styles.module.scss';

interface MenuItemWithIconProps {
  children: string;
  icon?: string;
  onClick?: () => void;
}

const MenuItemWithIcon: FC<MenuItemWithIconProps> = ({
  children,
  icon,
  onClick,
}) => (
  <button className={styles.item} onClick={onClick}>
    {icon && (
      <div className={styles.icon}>
        <Icon icon={icon} size={20} />
      </div>
    )}

    <div className={styles.text}>{children}</div>
  </button>
);

export { MenuItemWithIcon };
