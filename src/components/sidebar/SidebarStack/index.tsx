import React, { FC, useMemo } from 'react';
import styles from './styles.module.scss';

interface SidebarStackProps {}

const SidebarStack: FC<SidebarStackProps> = ({ children }) => {
  const nonEmptyChildren = useMemo(() => {
    if (!children) {
      return [];
    }

    return Array.isArray(children) ? children.filter(it => it) : [children];
  }, [children]);

  return (
    <div className={styles.stack}>
      {nonEmptyChildren.map((child, i) => (
        <div className={styles.card} key={i}>
          {child}
        </div>
      ))}
    </div>
  );
};

export { SidebarStack };
