import React, { FC } from 'react';
import styles from './styles.scss';

interface IProps {
  onEdit: () => void;
  onDelete: () => void;
}

const CommentMenu: FC<IProps> = ({ onEdit, onDelete }) => {
  return (
    <div className={styles.wrap}>
      <div className={styles.menu}>
        <div className={styles.item}>Редактировать</div>
        <div className={styles.item}>Удалить</div>
      </div>
    </div>
  );
};

export { CommentMenu };
