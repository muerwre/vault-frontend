import React, { FC, ReactNode, useMemo } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

interface SeparatedMenuProps {
  className?: string;
}

const SeparatedMenu: FC<SeparatedMenuProps> = ({ children, className }) => {
  const items = useMemo<ReactNode[]>(() => {
    if (!children) {
      return [];
    }

    return (Array.isArray(children) ? children : [children]).filter(it => it);
  }, [children]);

  return (
    <div className={classNames(styles.menu, className)}>
      {items.map((item, index) => (
        <div className={styles.item} key={index}>
          {item}
        </div>
      ))}
    </div>
  );
};

export { SeparatedMenu };
