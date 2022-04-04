import React, { useCallback, useState, VFC } from 'react';

import styles from '~/components/comment/CommentMenu/styles.module.scss';
import { MenuDots } from '~/components/common/MenuDots';

interface MenuAction {
  title: string;
  action: () => void;
}
interface CornerMenuProps {
  actions: MenuAction[];
}

const CornerMenu: VFC<CornerMenuProps> = ({ actions }) => {
  const [is_menu_opened, setIsMenuOpened] = useState(false);

  const onFocus = useCallback(() => setIsMenuOpened(true), [setIsMenuOpened]);
  const onBlur = useCallback(() => setIsMenuOpened(false), [setIsMenuOpened]);

  return (
    <div className={styles.wrap} onFocus={onFocus} onBlur={onBlur} tabIndex={-1}>
      <MenuDots onClick={onFocus} />

      {is_menu_opened && (
        <div className={styles.menu}>
          {actions.map(({ title, action }) => (
            <div className={styles.item} onMouseDown={action} key={title}>
              {title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { CornerMenu };
