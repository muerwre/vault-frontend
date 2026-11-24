import { FC, ReactNode } from 'react';

import styles from './styles.module.scss';

interface MenuItemWithIconProps {
  children: string;
  icon?: ReactNode;
  onClick?: () => void;
}

const MenuItemWithIcon: FC<MenuItemWithIconProps> = ({
  children,
  icon,
  onClick,
}) => (
  <button className={styles.item} onClick={onClick}>
    {icon && <div className={styles.icon}>{icon}</div>}

    <div className={styles.text}>{children}</div>
  </button>
);

export { MenuItemWithIcon };
