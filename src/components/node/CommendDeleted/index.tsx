import React, { FC, useCallback } from 'react';
import styles from './styles.scss';
import { Button } from '~/components/input/Button';
import { nodeLockComment } from '~/redux/node/actions';
import { IComment } from '~/redux/types';

interface IProps {
  id: IComment['id'];
  onDelete: typeof nodeLockComment;
}

const CommendDeleted: FC<IProps> = ({ id, onDelete }) => {
  const onRestore = useCallback(() => onDelete(id, false), [onDelete]);

  return (
    <div className={styles.wrap}>
      <div>Комментарий удалён</div>
      <Button
        size="mini"
        onClick={onRestore}
        color="link"
        iconLeft="restore"
        className={styles.button}
      >
        Восстановить
      </Button>
    </div>
  );
};

export { CommendDeleted };
