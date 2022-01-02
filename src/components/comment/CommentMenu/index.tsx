import React, { FC, useCallback, useState } from 'react';
import styles from './styles.module.scss';

interface IProps {
  onEdit: () => void;
  onDelete: () => void;
}

const CommentMenu: FC<IProps> = ({ onEdit, onDelete }) => {
  const [is_menu_opened, setIsMenuOpened] = useState(false);

  const onFocus = useCallback(() => setIsMenuOpened(true), [setIsMenuOpened]);
  const onBlur = useCallback(() => setIsMenuOpened(false), [setIsMenuOpened]);

  return (
    <div className={styles.wrap} onFocus={onFocus} onBlur={onBlur} tabIndex={-1}>
      <div className={styles.dot} />

      {is_menu_opened && (
        <div className={styles.menu}>
          <div className={styles.item} onMouseDown={onEdit}>
            Редактировать
          </div>
          <div className={styles.item} onMouseDown={onDelete}>
            Удалить
          </div>
        </div>
      )}
    </div>
  );
};

export { CommentMenu };
